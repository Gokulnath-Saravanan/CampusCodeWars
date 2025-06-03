import { connect } from '../config/database';
import { User } from '../models/User';
import logger from '../utils/logger';

const verifyAdmin = async () => {
  try {
    await connect();

    // Find admin user
    const admin = await User.findOne({ 
      $or: [
        { email: 'admin@campuscodewars.com' },
        { username: 'admin' }
      ]
    }).select('+password');

    if (admin) {
      logger.info('Admin user found:');
      logger.info(`Username: ${admin.username}`);
      logger.info(`Email: ${admin.email}`);
      logger.info(`Role: ${admin.role}`);
      logger.info(`Password exists: ${!!admin.password}`);
      logger.info(`Password length: ${admin.password.length}`);
    } else {
      logger.error('No admin user found in the database');
    }

    process.exit(0);
  } catch (error) {
    logger.error('Error verifying admin:', error);
    process.exit(1);
  }
};

verifyAdmin(); 