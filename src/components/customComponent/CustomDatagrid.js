/**
 * CustomDataGrid — Reusable data table component
 * Desktop: MUI DataGrid with built-in GridToolbar (filter, column toggle, density, search, export)
 * Mobile:  Card-per-row responsive view with search
 *
 * Features:
 * - Date range filter button group (Today, Yesterday, Last 7 Days, Last Month)
 * - Export to CSV/Excel functionality
 * - Column visibility toggle
 * - Density selector
 * - Quick search
 *
 * Single source of truth for all tabular data in the application.
 * Columns use DataGrid format: { field, headerName, flex?, minWidth?, renderCell?, sortable? }
 */
import { useState, useCallback } from 'react'
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
  GridToolbarExport
} from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Pagination from '@mui/material/Pagination'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { useTheme, alpha } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { format, subDays, startOfDay, endOfDay, startOfMonth, subMonths } from 'date-fns'
import Icon from 'src/components/Icon'

/* ── Date Range Presets ── */
const DATE_RANGE_PRESETS = [
  { label: 'Today', value: 'today', getRange: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: 'Yesterday', value: 'yesterday', getRange: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
  { label: 'Last 7 Days', value: 'last7days', getRange: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { label: 'Last Month', value: 'lastMonth', getRange: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfDay(new Date()) }) },
  { label: 'All Time', value: 'all', getRange: () => ({ from: null, to: null }) }
]

/* ── Date Filter Button Group ── */
function DateFilterButtonGroup({ value, onChange, disabled }) {
  const theme = useTheme()

  return (
    <ButtonGroup
      variant='outlined'
      size='small'
      disabled={disabled}
      sx={{
        '& .MuiButton-root': {
          fontSize: '0.75rem',
          px: 1.5,
          py: 0.5,
          textTransform: 'none',
          fontWeight: 600,
          borderColor: alpha(theme.palette.primary.main, 0.3),
          '&.Mui-selected, &.active': {
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderColor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }
        }
      }}
    >
      {DATE_RANGE_PRESETS.map(preset => (
        <Button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={value === preset.value ? 'active' : ''}
          sx={{
            ...(value === preset.value && {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': { bgcolor: theme.palette.primary.dark }
            })
          }}
        >
          {preset.label}
        </Button>
      ))}
    </ButtonGroup>
  )
}

/* ── Export Menu ── */
function ExportMenu({ rows, columns, fileName = 'export' }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleExportCSV = () => {
    const headers = columns.filter(c => c.field !== 'actions').map(c => c.headerName || c.field)
    const fields = columns.filter(c => c.field !== 'actions').map(c => c.field)

    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        fields.map(field => {
          const value = row[field]
          if (value == null) return ''
          const strVal = String(value).replace(/"/g, '""')
          return strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')
            ? `"${strVal}"`
            : strVal
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${fileName}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    setAnchorEl(null)
  }

  return (
    <>
      <Tooltip title='Export'>
        <Button
          size='small'
          onClick={e => setAnchorEl(e.currentTarget)}
          startIcon={<Icon icon='tabler:download' fontSize={16} />}
          sx={{ fontSize: '0.8rem', textTransform: 'none' }}
        >
          Export
        </Button>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleExportCSV}>
          <Icon icon='tabler:file-spreadsheet' fontSize={18} style={{ marginRight: 8 }} />
          Export as CSV
        </MenuItem>
      </Menu>
    </>
  )
}

/* ── Desktop Toolbar ── */
function GridToolbar({ showExport, showDateFilter, dateFilter, onDateFilterChange, rows, columns, exportFileName }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        px: 2.5,
        py: 1.5,
        borderBottom: t => `1px solid ${t.palette.divider}`
      }}
    >
      {/* Date Filter Row */}
      {showDateFilter && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DateFilterButtonGroup value={dateFilter} onChange={onDateFilterChange} />
        </Box>
      )}

      {/* Tools Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        <Stack direction='row' spacing={0.5} alignItems='center'>
          <GridToolbarColumnsButton sx={{ fontSize: '0.8rem' }} />
          <GridToolbarFilterButton sx={{ fontSize: '0.8rem' }} />
          <GridToolbarDensitySelector sx={{ fontSize: '0.8rem' }} />
          {showExport && <ExportMenu rows={rows} columns={columns} fileName={exportFileName} />}
        </Stack>
        <GridToolbarQuickFilter
          debounceMs={300}
          sx={{
            '& .MuiInputBase-root': { fontSize: '0.875rem', borderRadius: 2 },
            minWidth: 220,
            maxWidth: 320
          }}
          placeholder='Search…'
        />
      </Box>
    </Box>
  )
}

/* ── Mobile Search Bar ── */
function MobileSearchBar({ value, onChange, showDateFilter, dateFilter, onDateFilterChange, showExport, rows, columns, exportFileName }) {
  const theme = useTheme()

  return (
    <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
      {/* Date Filter for Mobile */}
      {showDateFilter && (
        <Box sx={{ mb: 1.5, overflowX: 'auto', pb: 0.5 }}>
          <ButtonGroup
            variant='outlined'
            size='small'
            sx={{
              '& .MuiButton-root': {
                fontSize: '0.68rem',
                px: 1,
                py: 0.4,
                textTransform: 'none',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                borderColor: alpha(theme.palette.primary.main, 0.3),
                '&.active': {
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.main
                }
              }
            }}
          >
            {DATE_RANGE_PRESETS.map(preset => (
              <Button
                key={preset.value}
                onClick={() => onDateFilterChange(preset.value)}
                className={dateFilter === preset.value ? 'active' : ''}
                sx={{
                  ...(dateFilter === preset.value && {
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText
                  })
                }}
              >
                {preset.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          size='small'
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder='Search…'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Icon icon='tabler:search' fontSize={18} />
              </InputAdornment>
            ),
            endAdornment: value ? (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={() => onChange('')} edge='end'>
                  <Icon icon='tabler:x' fontSize={16} />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: { borderRadius: 2 }
          }}
        />
        {showExport && (
          <ExportMenu rows={rows} columns={columns} fileName={exportFileName} />
        )}
      </Box>
    </Box>
  )
}

/* ── Mobile Card Row ── */
function MobileCard({ row, columns, theme, onClick }) {
  const actionCol = columns.find(c => c.field === 'actions')
  const dataCols = columns.filter(c => c.headerName && c.field !== 'actions')

  return (
    <Card
      variant='outlined'
      onClick={onClick}
      sx={{
        mb: 1.5,
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 2,
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: theme.shadows[2]
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {dataCols.map((col, i) => (
          <Box
            key={col.field}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 0.75,
              ...(i < dataCols.length - 1 && {
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`
              })
            }}
          >
            <Typography
              variant='caption'
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                fontSize: '0.68rem',
                flexShrink: 0,
                minWidth: 80
              }}
            >
              {col.headerName}
            </Typography>
            <Box sx={{ textAlign: 'right', ml: 2, minWidth: 0, flex: 1 }}>
              {col.renderCell
                ? col.renderCell({ row, value: row[col.field] })
                : (
                  <Typography variant='body2' noWrap>
                    {row[col.field] ?? '—'}
                  </Typography>
                )}
            </Box>
          </Box>
        ))}

        {actionCol?.renderCell && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              pt: 1,
              mt: 0.5,
              borderTop: `1px solid ${theme.palette.divider}`
            }}
            onClick={e => e.stopPropagation()}
          >
            {actionCol.renderCell({ row, value: null })}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

/* ── Main Component ── */
const CustomDataGrid = ({
  rows = [],
  columns = [],
  loading = false,
  paginationModel = { page: 0, pageSize: 10 },
  onPaginationModelChange,
  pageSizeOptions = [10, 25, 50],
  paginationMode = 'server',
  rowCount = 0,
  disableRowSelectionOnClick = true,
  showToolbar = true,
  showExport = true,
  showDateFilter = false,
  dateFilter = 'all',
  onDateFilterChange,
  exportFileName = 'export',
  emptyText = 'No records found.',
  onRowClick,
  getRowId = (row) => row.id,
  sx = {},
  ...otherProps
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileSearch, setMobileSearch] = useState('')

  const filteredRows = useCallback(() => {
    if (!isMobile || !mobileSearch) return rows

    const term = mobileSearch.toLowerCase()

    return rows.filter(row =>
      columns.some(col => {
        const v = row[col.field]

        return v != null && String(v).toLowerCase().includes(term)
      })
    )
  }, [isMobile, mobileSearch, rows, columns])

  /* ── Desktop View ── */
  if (!isMobile) {
    return (
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns.map(c => ({
          sortable: true,
          disableColumnMenu: false,
          ...c
        }))}
        getRowId={getRowId}
        loading={loading}
        pageSizeOptions={pageSizeOptions}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        paginationMode={paginationMode}
        rowCount={rowCount}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        onRowClick={onRowClick}
        slots={{
          toolbar: showToolbar
            ? () => (
                <GridToolbar
                  showExport={showExport}
                  showDateFilter={showDateFilter}
                  dateFilter={dateFilter}
                  onDateFilterChange={onDateFilterChange}
                  rows={rows}
                  columns={columns}
                  exportFileName={exportFileName}
                />
              )
            : null
        }}
        rowHeight={56}
        sx={{
          border: 'none',

          /* Column Headers */
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.6)
              : theme.palette.grey[50],
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            letterSpacing: '0.5px',
            color: theme.palette.text.secondary,
            borderBottom: `1px solid ${theme.palette.divider}`
          },
          '& .MuiDataGrid-columnSeparator': { display: 'none' },

          /* Cells */
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            fontSize: '0.875rem',
            py: 1,
            display: 'flex',
            alignItems: 'center',
            outline: 'none !important'
          },

          /* Rows */
          '& .MuiDataGrid-row': {
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            },
            '&:last-of-type .MuiDataGrid-cell': {
              borderBottom: 'none'
            }
          },

          /* Footer */
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${theme.palette.divider}`
          },

          /* Overlay */
          '& .MuiDataGrid-overlayWrapper': {
            minHeight: 200
          },
          ...sx
        }}
        {...otherProps}
      />
    )
  }

  /* ── Mobile View ── */
  const visibleRows = filteredRows()

  const totalPages = Math.ceil(
    (mobileSearch ? visibleRows.length : rowCount || rows.length) / paginationModel.pageSize
  )
  const pagedRows = mobileSearch
    ? visibleRows.slice(
        paginationModel.page * paginationModel.pageSize,
        (paginationModel.page + 1) * paginationModel.pageSize
      )
    : visibleRows

  return (
    <Box>
      {showToolbar && (
        <MobileSearchBar
          value={mobileSearch}
          onChange={setMobileSearch}
          showDateFilter={showDateFilter}
          dateFilter={dateFilter}
          onDateFilterChange={onDateFilterChange}
          showExport={showExport}
          rows={rows}
          columns={columns}
          exportFileName={exportFileName}
        />
      )}

      <Box sx={{ px: 2, pb: 2 }}>
        {/* Loading */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              variant='rectangular'
              height={100}
              sx={{ mb: 1.5, borderRadius: 2 }}
            />
          ))
        ) : pagedRows.length === 0 ? (
          /* Empty */
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Icon icon='tabler:database-off' fontSize={40} style={{ color: theme.palette.text.disabled }} />
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              {emptyText}
            </Typography>
          </Box>
        ) : (
          /* Cards */
          pagedRows.map((row, idx) => {
            const rowId = typeof getRowId === 'function' ? getRowId(row) : (row.id ?? idx)
            return (
              <MobileCard
                key={rowId}
                row={row}
                columns={columns}
                theme={theme}
                onClick={onRowClick ? () => onRowClick({ row }) : undefined}
              />
            )
          })
        )}

        {/* Pagination */}
        {!loading && pagedRows.length > 0 && (
          <Stack spacing={1.5} alignItems='center' sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={paginationModel.page + 1}
              onChange={(_, p) => onPaginationModelChange?.({ ...paginationModel, page: p - 1 })}
              color='primary'
              size='small'
              showFirstButton
              showLastButton
            />
            <Stack direction='row' alignItems='center' spacing={1}>
              <Typography variant='caption' color='text.secondary'>
                Rows per page:
              </Typography>
              <select
                value={paginationModel.pageSize}
                onChange={e =>
                  onPaginationModelChange?.({ page: 0, pageSize: Number(e.target.value) })
                }
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {pageSizeOptions.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  )
}

export default CustomDataGrid

// Export date range presets for use in other components
export { DATE_RANGE_PRESETS }

// Helper function to get date range from preset value
export const getDateRangeFromPreset = (presetValue) => {
  const preset = DATE_RANGE_PRESETS.find(p => p.value === presetValue)
  if (!preset) return { from: null, to: null }
  return preset.getRange()
}
