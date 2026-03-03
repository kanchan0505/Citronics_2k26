/**
 * AddDialog — Reusable create/edit dialog for events and users
 *
 * Uses CustomTextField from components/mui.
 * Dynamically renders form fields based on `fields` config array.
 *
 * Props:
 *  open          bool           — dialog visibility
 *  onClose       fn             — close handler
 *  onSubmit      fn(formData)   — submit handler (async ok)
 *  title         string         — dialog title
 *  icon          string         — tabler icon name
 *  fields        array          — form field config: { name, label, type, required, options[], gridSize, ... }
 *  initialValues object         — prefill values for edit mode
 *  submitLabel   string         — submit button text
 *  loading       bool           — shows spinner on submit
 */
import { useState, useEffect, useCallback } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import CustomTextField from 'src/components/mui/TextField'
import Icon from 'src/components/Icon'

const AddDialog = ({
  open = false,
  onClose,
  onSubmit,
  title = 'Add Item',
  icon = 'tabler:plus',
  fields = [],
  initialValues = {},
  submitLabel = 'Save',
  loading = false,
  maxWidth = 'sm'
}) => {
  const [form, setForm] = useState({})
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Initialize form from initialValues or field defaults
  useEffect(() => {
    if (!open) return
    setError('')
    setShowPassword(false)

    const defaults = {}
    fields.forEach(f => {
      defaults[f.name] = initialValues[f.name] ?? f.defaultValue ?? ''
    })
    setForm(defaults)
  }, [open, initialValues, fields])

  const set = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }, [])

  const validate = useCallback(() => {
    for (const field of fields) {
      if (field.required && !String(form[field.name] ?? '').trim()) {
        return `${field.label} is required.`
      }
      if (field.type === 'email' && form[field.name]) {
        if (!/\S+@\S+\.\S+/.test(form[field.name])) return 'Valid email is required.'
      }
      if (field.minLength && form[field.name] && form[field.name].length < field.minLength) {
        return `${field.label} must be at least ${field.minLength} characters.`
      }
      if (field.validate) {
        const err = field.validate(form[field.name], form)
        if (err) return err
      }
    }

    return null
  }, [fields, form])

  const handleSubmit = async e => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')

    try {
      await onSubmit(form)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Operation failed')
    }
  }

  const renderField = (field) => {
    const { name, label, type = 'text', options, required, disabled, helperText, icon: fieldIcon, multiline, minRows, maxRows, placeholder } = field
    const gridSize = field.gridSize || 12

    // Select field
    if (type === 'select' && options) {
      return (
        <Grid item xs={12} sm={gridSize} key={name}>
          <FormControl fullWidth disabled={disabled || loading}>
            <InputLabel>{label}{required ? ' *' : ''}</InputLabel>
            <Select
              value={form[name] ?? ''}
              label={`${label}${required ? ' *' : ''}`}
              onChange={e => set(name, e.target.value)}
            >
              {options.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
            {helperText && (
              <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, px: 1.5 }}>
                {helperText}
              </Typography>
            )}
          </FormControl>
        </Grid>
      )
    }

    // Password field
    if (type === 'password') {
      return (
        <Grid item xs={12} sm={gridSize} key={name}>
          <CustomTextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            label={`${label}${required ? ' *' : ''}`}
            value={form[name] ?? ''}
            onChange={e => set(name, e.target.value)}
            disabled={disabled || loading}
            helperText={helperText}
            placeholder={placeholder}
            InputProps={{
              startAdornment: fieldIcon ? (
                <InputAdornment position='start'>
                  <Icon icon={fieldIcon} fontSize={16} />
                </InputAdornment>
              ) : null,
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={() => setShowPassword(p => !p)} edge='end'>
                    <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} fontSize={16} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>
      )
    }

    // Default text / number / email / datetime-local / textarea
    return (
      <Grid item xs={12} sm={gridSize} key={name}>
        <CustomTextField
          fullWidth
          type={type}
          label={`${label}${required ? ' *' : ''}`}
          value={form[name] ?? ''}
          onChange={e => set(name, e.target.value)}
          disabled={disabled || loading}
          helperText={helperText}
          placeholder={placeholder}
          multiline={multiline}
          minRows={minRows}
          maxRows={maxRows}
          InputLabelProps={type === 'datetime-local' ? { shrink: true } : undefined}
          inputProps={type === 'number' ? { min: field.min, max: field.max, step: field.step } : undefined}
          InputProps={
            fieldIcon
              ? {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon={fieldIcon} fontSize={16} />
                    </InputAdornment>
                  )
                }
              : undefined
          }
        />
      </Grid>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, m: { xs: 1, sm: 2 } } }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ py: 2, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon icon={icon} fontSize={20} />
              <Typography variant='h6' fontWeight={700} sx={{ lineHeight: 1 }}>
                {title}
              </Typography>
            </Box>
            <IconButton onClick={onClose} disabled={loading} size='small' sx={{ color: 'text.secondary' }}>
              <Icon icon='tabler:x' fontSize={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {fields.map(renderField)}
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} disabled={loading} variant='outlined'>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={14} color='inherit' />
              ) : (
                <Icon icon={icon} fontSize={16} />
              )
            }
          >
            {loading ? 'Saving…' : submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddDialog
