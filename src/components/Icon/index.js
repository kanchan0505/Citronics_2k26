// ** Icon Imports
import dynamic from 'next/dynamic'

// Dynamically import @iconify/react with SSR disabled to prevent prerendering issues
const Icon = dynamic(() => import('@iconify/react').then(mod => mod.Icon), {
  ssr: false,
  loading: () => null
})

const IconifyIcon = ({ icon, ...rest }) => {
  return <Icon icon={icon} fontSize='1.375rem' {...rest} />
}

export default IconifyIcon
