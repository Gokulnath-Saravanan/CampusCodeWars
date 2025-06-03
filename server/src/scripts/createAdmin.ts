import { connect } from '../config/database';
import { User } from '../models/User';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';

const createAdminUser = async () => {
  try {
    await connect();

    // Check if admin user already exists
    const adminExists = await User.findOne({ 
      $or: [
        { email: 'admin@campuscodewars.com' },
        { username: 'admin' }
      ]
    });

    if (adminExists) {
      // Update admin password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      
      await User.findByIdAndUpdate(adminExists._id, { 
        password: hashedPassword,
        role: 'admin' // Ensure role is admin
      });
      
      logger.info('Admin password updated successfully');
      logger.info('You can now login with:');
      logger.info('Email: admin@campuscodewars.com');
      logger.info('Password: Admin@123');
      process.exit(0);
    }

    // If no admin exists, create one
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    const admin = await User.create({
      username: 'admin',
      email: 'admin@campuscodewars.com',
      password: hashedPassword,
      role: 'admin'
    });

    logger.info('Admin user created successfully');
    logger.info('You can now login with:');
    logger.info('Email: admin@campuscodewars.com');
    logger.info('Password: Admin@123');
    process.exit(0);
  } catch (error) {
    logger.error('Error managing admin user:', error);
    process.exit(1);
  }
};

createAdminUser(); 