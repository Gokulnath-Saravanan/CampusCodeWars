import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import UserManagement from './UserManagement';
import ProblemManagement from './ProblemManagement';
import ContestManagement from './ContestManagement';
import ProblemGenerator from './ProblemGenerator';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage users, problems, and contests from this central dashboard.
        </Typography>
      </Paper>

      <Paper elevation={3}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="User Management" />
          <Tab label="Problem Management" />
          <Tab label="Contest Management" />
        </Tabs>
        <Divider />

        <TabPanel value={currentTab} index={0}>
          <UserManagement />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ProblemGenerator />
            </Grid>
            <Grid item xs={12}>
              <ProblemManagement />
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <ContestManagement />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 