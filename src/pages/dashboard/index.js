import DashboardView from 'src/views/dashboard'

/**
 * Dashboard Page
 */
const Dashboard = () => {
  return <DashboardView />
}

Dashboard.acl = {
  action: 'read',
  subject: 'dashboard'
}

export default Dashboard
