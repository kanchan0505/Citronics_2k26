
import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Container from '@mui/material/Container'
import Tooltip from '@mui/material/Tooltip'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'

/**
 * Team Member Card Component
 */
const TeamMemberCard = ({ member }) => {
  const c = useAppPalette()
  const [isHovered, setIsHovered] = useState(false)
  const isMobile = useMediaQuery(c.theme.breakpoints.down('md'))

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        borderRadius: '16px',
        padding: { xs: '12px', md: '16px' },
        textAlign: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        backgroundColor: c.isDark ? c.background : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${c.isDark ? c.whiteA10 : 'rgba(0, 0, 0, 0.08)'}`,
        backdropFilter: 'blur(10px)',
        minHeight: '300px',
        transform: isMobile ? 'scale(1)' : (isHovered ? 'scale(1.02)' : 'scale(1)'),
        boxShadow: isMobile
          ? (c.isDark ? `0 8px 24px rgba(0,0,0,0.3)` : '0 8px 24px rgba(0,0,0,0.08)')
          : (isHovered
              ? (c.isDark
                  ? `0 12px 40px rgba(0,0,0,0.45), 0 0 0 0.5px ${c.whiteA6} inset`
                  : '0 12px 40px rgba(0,0,0,0.12)')
              : (c.isDark ? `0 8px 24px rgba(0,0,0,0.3)` : '0 8px 24px rgba(0,0,0,0.08)'))
      }}
    >
      {/* Background gradient wave */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: c.isDark
            ? `linear-gradient(to top, ${c.primaryA25}, transparent)`
            : `linear-gradient(to top, ${c.primaryA15}, transparent)`,
          borderRadius: '50% 50% 0 0',
          transform: isMobile ? 'scaleY(1)' : (isHovered ? 'scaleY(1)' : 'scaleY(0)'),
          transformOrigin: 'bottom',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1
        }}
      />

      {/* Member Image */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: `4px solid ${c.isDark ? c.whiteA15 : 'rgba(0, 0, 0, 0.08)'}`,
          backgroundColor: c.isDark ? c.whiteA5 : 'rgba(0, 0, 0, 0.03)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          borderColor: isMobile ? c.primary : (isHovered ? c.primary : (c.isDark ? c.whiteA15 : 'rgba(0, 0, 0, 0.08)')),
          transform: isMobile ? 'scale(1.05)' : (isHovered ? 'scale(1.05)' : 'scale(1)')
        }}
      >
        <Box
          component='img'
          src={member.imageSrc}
          alt={member.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isMobile ? 'scale(1.1)' : (isHovered ? 'scale(1.1)' : 'scale(1)')
          }}
        />
      </Box>

      {/* Member Info */}
      <Typography
        variant='h6'
        sx={{
          position: 'relative',
          zIndex: 2,
          mt: 2,
          fontWeight: 600,
          fontSize: '1.1rem',
          color: c.isDark ? c.white : c.text,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {member.name}
      </Typography>

      <Typography
        variant='body2'
        sx={{
          position: 'relative',
          zIndex: 2,
          mt: 0.5,
          fontSize: '0.875rem',
          color: c.isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.75)',
          mb: 1.5
        }}
      >
        {member.designation}
      </Typography>

      {/* Social Links */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          opacity: isMobile ? 1 : (isHovered ? 1 : 0.3),
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexWrap: 'wrap'
        }}
      >
        {member.socialLinks && member.socialLinks.length > 0 && (
          member.socialLinks.map((link, idx) => (
            <Tooltip key={idx} title={link.label}>
              <IconButton
                component='a'
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                size='small'
                sx={{
                  color: c.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    color: c.primary,
                    backgroundColor: c.isDark ? c.whiteA10 : c.primaryA10,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Icon icon={link.icon} fontSize={20} />
              </IconButton>
            </Tooltip>
          ))
        )}
      </Box>
    </Card>
  )
}

/**
 * Developers Team Section Component
 */
const DevelopersTeamSection = ({ title = 'DEVELOPMENT TEAM', description = '', members = [] }) => {
  const c = useAppPalette()

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: c.isDark ? c.background : c.background,
        py: { xs: 2, md: 4, lg: 6 }
      }}
    >
      <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
            gap: { xs: 4, md: 8 },
            alignItems: { xs: 'center', md: 'flex-start' },
            mb: { xs: 6, md: 8, lg: 10 },
            mt: { xs: 4, md: 6, lg: 8 },
            textAlign: { xs: 'center', md: 'left' }
          }}
        >
          {/* Title and Description */}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Typography
              variant='h3'
              sx={{
                fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem', lg: '3.5rem' },
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                color: c.isDark ? c.white : c.text
              }}
            >
              <Typography
                component='span'
                sx={{
                  display: 'block',
                  fontSize: { xs: '1.25rem', sm: '1.4rem', md: '1.5rem' },
                  fontWeight: 600,
                  color: c.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  mb: 1
                }}
              >
                OUR
              </Typography>
              {title}
            </Typography>

            {description && (
              <Typography
                variant='body1'
                sx={{
                  maxWidth: { xs: '100%', md: '600px' },
                  color: c.isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.85)',
                  fontSize: { xs: '1.05rem', md: '1rem', lg: '1.1rem' },
                  lineHeight: 1.7
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Team Members Grid */}
        {members && members.length > 0 && (
          <Grid
            container
            spacing={{ xs: 3, md: 4, lg: 5 }}
            sx={{
              maxWidth: '1200px',
              mx: 'auto'
            }}
          >
            {members.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <TeamMemberCard member={member} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default DevelopersTeamSection
