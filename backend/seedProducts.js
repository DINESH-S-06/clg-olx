const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Product = require('./models/Product');

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB!');

    // Find or create a demo student seller
    let studentUser = await User.findOne({ email: 'student.demo@campus.edu' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Dinesh Karthik',
        email: 'student.demo@campus.edu',
        password: 'password123',
        whatsappNumber: '+919876543210',
        role: 'student',
        hostelBlock: 'Hostel Block B (Boys)',
        department: 'Information Technology',
        isVerifiedStudent: true,
      });
      console.log('Created student user');
    }

    let staffUser = await User.findOne({ email: 'staff.demo@campus.edu' });
    if (!staffUser) {
      staffUser = await User.create({
        name: 'Prof. Rajesh Kumar',
        email: 'staff.demo@campus.edu',
        password: 'password123',
        whatsappNumber: '+919876501234',
        role: 'staff',
        hostelBlock: 'Staff Quarters Q-12',
        department: 'Electronics & Communication',
        isVerifiedStudent: true,
      });
      console.log('Created staff user');
    }

    let sellerUser = await User.findOne({ email: 'seller.demo@campus.edu' });
    if (!sellerUser) {
      sellerUser = await User.create({
        name: 'Campus Book Store & Stationery',
        email: 'seller.demo@campus.edu',
        password: 'password123',
        whatsappNumber: '+919876599887',
        role: 'seller',
        hostelBlock: 'Main Library & Study Area',
        storeName: 'KEC Campus Bookstore',
        isVerifiedStudent: true,
      });
      console.log('Created store seller user');
    }

    const sampleProducts = [
      {
        title: 'Casio fx-991EX ClassWiz Scientific Calculator (Original)',
        description: 'Excellent condition with slide case. 552 functions, high-resolution LCD, spreadsheet function. Ideal for Engineering Mathematics & Physics.',
        category: 'Electronics',
        condition: 'Like New',
        price: 950,
        imageUrl: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?auto=format&fit=crop&w=800&q=80',
        seller: studentUser._id,
        isSold: false,
      },
      {
        title: 'Higher Engineering Mathematics - B.S. Grewal (44th Edition)',
        description: 'Clean textbook with no markings or torn pages. Covers calculus, differential equations, and complex analysis. Essential for 1st & 2nd year students.',
        category: 'Books',
        condition: 'Gently Used',
        price: 380,
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        seller: sellerUser._id,
        isSold: false,
      },
      {
        title: 'Omega Engineering Mini Drafter with Board Clips & Cover Bag',
        description: 'Complete drawing kit for Engineering Graphics. Steel arm with smooth pivot action, 360 degree protractor head. Free drawing sheet container tube included.',
        category: 'Lab Equipment',
        condition: 'Gently Used',
        price: 450,
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        seller: studentUser._id,
        isSold: false,
      },
      {
        title: 'Hercules Roadeo 21-Speed Gear Bicycle for Campus Commute',
        description: 'Smooth riding campus cycle with dual disc brakes and front suspension. Fitted with mudguards, bell, and heavy-duty steel lock. Perfect for hostel to class commute.',
        category: 'Others',
        condition: 'Gently Used',
        price: 3200,
        imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
        seller: studentUser._id,
        isSold: false,
      },
      {
        title: 'Foldable Bed Study Table with iPad/Book Stand & Cup Slot',
        description: 'Sturdy ergonomic wooden laptop desk with non-slip curved legs. Lightweight, easy to fold and store under hostel bed. Great for late night exam prep.',
        category: 'Furniture',
        condition: 'Like New',
        price: 499,
        imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
        seller: studentUser._id,
        isSold: false,
      },
      {
        title: 'White Cotton Lab Coat (Full Sleeve - Size 40) + Chemistry Goggles',
        description: 'Mandatory standard cotton apron for Chemistry, Physics and Metallurgy labs. Freshly washed, no chemical stains. Includes UV safety goggles.',
        category: 'Lab Equipment',
        condition: 'Like New',
        price: 240,
        imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
        seller: staffUser._id,
        isSold: false,
      },
      {
        title: 'Arduino Uno R3 Starter Sensor Kit with Breadboard & Cables',
        description: 'Genuine ATmega328P Arduino board with 30+ components: ultrasonic sensor, servo motor, LEDs, resistors, RFID reader, and jumper wires. Ready for IoT projects.',
        category: 'Electronics',
        condition: 'Brand New',
        price: 890,
        imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
        seller: staffUser._id,
        isSold: false,
      },
      {
        title: 'Hostel Mesh Ergonomic Office Chair with Adjustable Lumbar Support',
        description: 'Breathable high-back mesh chair with hydraulic height adjustment and smooth caster wheels. Very comfortable for long study hours.',
        category: 'Furniture',
        condition: 'Gently Used',
        price: 1800,
        imageUrl: 'https://images.unsplash.com/photo-1580481077195-c328ad4f4477?auto=format&fit=crop&w=800&q=80',
        seller: staffUser._id,
        isSold: false,
      }
    ];

    for (const item of sampleProducts) {
      const existing = await Product.findOne({ title: item.title });
      if (!existing) {
        await Product.create(item);
        console.log(`Added: ${item.title}`);
      } else {
        console.log(`Already exists: ${item.title}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
