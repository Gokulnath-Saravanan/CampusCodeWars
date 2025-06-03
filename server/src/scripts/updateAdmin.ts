import { connect } from '../config/database';
import { User } from '../models/User';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';

const updateAdmin = async () => {
  try {
    await connect();

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      logger.error('Admin user not found');
      process.exit(1);
    }

    // Update admin email and password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    await User.findByIdAndUpdate(admin._id, {
      email: 'admin@campuscodewars.com',
      password: hashedPassword,
      role: 'admin'
    });

    logger.info('Admin user updated successfully');
    logger.info('New login credentials:');
    logger.info('Email: admin@campuscodewars.com');
    logger.info('Password: Admin@123');
    process.exit(0);
  } catch (error) {
    logger.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdmin(); 