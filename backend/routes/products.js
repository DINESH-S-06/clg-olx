const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Report = require('../models/Report');
const { auth, upload } = require('../middleware');

// @route   GET /api/products
// @desc    Get all products with search, category, condition, price, and status filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      isSold,
      seller,
      sort,
    } = req.query;

    const filter = {};

    // Safe Regex Escaping to prevent syntax crashes on special characters (e.g. C++, parentheses, ?, etc.)
    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // 1. Text Search filter (matches title, description, category)
    if (search && search.trim() !== '') {
      const rawTerm = search.trim();
      const sanitized = escapeRegex(rawTerm);
      const words = rawTerm.split(/\s+/).filter(Boolean).map(escapeRegex);

      filter.$or = [
        { title: { $regex: new RegExp(sanitized, 'i') } },
        { description: { $regex: new RegExp(sanitized, 'i') } },
        { category: { $regex: new RegExp(sanitized, 'i') } },
        // Also match if every word appears in the title or description
        { $and: words.map((w) => ({ title: { $regex: new RegExp(w, 'i') } })) },
        { $and: words.map((w) => ({ description: { $regex: new RegExp(w, 'i') } })) },
      ];
    }

    // 2. Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // 3. Condition filter
    if (condition && condition !== 'All') {
      filter.condition = condition;
    }

    // 4. Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 5. isSold status filter: automatically remove sold items from the web by default
    if (typeof isSold !== 'undefined') {
      if (isSold === 'all') {
        // Return both available and sold if explicitly requested
      } else {
        filter.isSold = isSold === 'true';
      }
    } else {
      // Default: Remove sold out items from the feed
      filter.isSold = false;
    }

    // 6. Specific seller filter
    if (seller) {
      filter.seller = seller;
    }

    // Sorting options
    let sortQuery = { createdAt: -1 }; // default newest first
    if (sort === 'price_asc') {
      sortQuery = { price: 1 };
    } else if (sort === 'price_desc') {
      sortQuery = { price: -1 };
    } else if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    }

    const products = await Product.find(filter)
      .populate('seller', 'name email whatsappNumber hostelBlock role department storeName isVerifiedStudent')
      .sort(sortQuery);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products.',
      error: error.message,
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get a single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'name email whatsappNumber hostelBlock role department storeName isVerifiedStudent'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving product.',
      error: error.message,
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product listing with image upload
// @access  Private (auth required)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, condition, price } = req.body;
    let imageUrl = req.body.imageUrl || '';

    // If an image was uploaded (Cloudinary or local static storage)
    if (req.file) {
      if (req.file.path && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'))) {
        imageUrl = req.file.path;
      } else if (req.file.filename) {
        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost:5000';
        imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      } else {
        imageUrl = req.file.path || '';
      }
    }

    // Validation
    if (!title || !description || !category || !condition || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, condition, price.',
      });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number.',
      });
    }

    // Seller is the authenticated user's ID
    const sellerId = (req.user && (req.user.id || req.user._id))?.toString();

    const product = new Product({
      title: title.trim(),
      description: description.trim(),
      category,
      condition,
      price: numericPrice,
      imageUrl,
      seller: sellerId,
      isSold: false,
    });

    await product.save();

    // Populate seller details to return in response
    await product.populate('seller', 'name email whatsappNumber hostelBlock role department storeName isVerifiedStudent');

    return res.status(201).json({
      success: true,
      message: 'Product listed successfully!',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error creating product listing.',
      error: error.message,
    });
  }
});

// Common handler to mark product as sold
const markProductAsSold = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Verify that the authenticated user is the seller
    const currentUserId = (req.user && (req.user.id || req.user._id))?.toString();
    if (product.seller.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the seller can mark this item as sold.',
      });
    }

    // Set isSold to true (or boolean from request body if explicitly provided)
    product.isSold = req.body && req.body.isSold !== undefined ? Boolean(req.body.isSold) : true;
    await product.save();
    await product.populate('seller', 'name email whatsappNumber hostelBlock role department storeName isVerifiedStudent');

    return res.status(200).json({
      success: true,
      message: `Product marked as ${product.isSold ? 'sold' : 'available'}.`,
      product,
    });
  } catch (error) {
    console.error('Update product status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error updating product status.',
      error: error.message,
    });
  }
};

// @route   POST /api/products/:id/report
// @desc    Report a product listing (authenticated users)
// @access  Private (auth required)
router.post('/:id/report', auth, async (req, res) => {
  try {
    const { reason, details } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please select or provide a reason for reporting this listing.',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product listing not found.',
      });
    }

    const currentUserId = (req.user && (req.user.id || req.user._id))?.toString();
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to report listings.',
      });
    }

    // Check if user has already reported this listing
    const existingReport = await Report.findOne({
      product: req.params.id,
      reportedBy: currentUserId,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a report for this listing. Our moderation team is reviewing it.',
      });
    }

    const report = new Report({
      product: req.params.id,
      reportedBy: currentUserId,
      reason: reason.trim(),
      details: (details || '').trim(),
    });

    await report.save();

    return res.status(201).json({
      success: true,
      message: 'Listing reported successfully. Thank you for helping keep Campus Connect safe and trustworthy!',
      report,
    });
  } catch (error) {
    console.error('Report listing error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error submitting report.',
      error: error.message,
    });
  }
});

// @route   PATCH /api/products/:id/sold
// @desc    Mark product as sold (Seller only)
// @access  Private (auth required)
router.patch('/:id/sold', auth, markProductAsSold);

// @route   PATCH /api/products/:id
// @desc    Update product status / mark as sold (Seller only)
// @access  Private (auth required)
router.patch('/:id', auth, markProductAsSold);

// @route   DELETE /api/products/:id
// @desc    Delete a product listing (Seller only)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const currentUserId = (req.user && (req.user.id || req.user._id))?.toString();
    if (product.seller.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the seller can delete this listing.',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Product listing deleted successfully.',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting product.',
      error: error.message,
    });
  }
});

module.exports = router;
