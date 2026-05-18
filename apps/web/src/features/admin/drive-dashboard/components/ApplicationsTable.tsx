import {
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import type { ApplicationRecord, ApplicationStatus } from "@pearl/common";
import { ALL_STATUSES, STATUS_CHIP_COLOR } from "./types";
import { currentTheme } from "../../../../theme/theme";

export interface ApplicationsTableProps {
  applications: ApplicationRecord[];
  updatingIds: Set<string>;
  onStatusChange: (
    applicationId: string,
    newStatus: ApplicationStatus,
    studentName: string,
  ) => void;
}

export default function ApplicationsTable({
  applications,
  updatingIds,
  onStatusChange,
}: ApplicationsTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 700 }} aria-label="applications table">
        <TableHead>
          <TableRow>
            <TableCell>Candidate</TableCell>
            <TableCell>Register No.</TableCell>
            <TableCell>Department</TableCell>
            <TableCell align="center">CGPA</TableCell>
            <TableCell>Skills</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell>Applied On</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((app) => {
            const isUpdating = updatingIds.has(app.id);
            return (
              <TableRow
                key={app.id}
                sx={{
                  "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
                  opacity: isUpdating ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {/* Candidate */}
                <TableCell>
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.primary"
                    >
                      {app.student.name}
                    </Typography>
                    {app.student.isPlaced && (
                      <Chip
                        label="Placed"
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ mt: 0.5, fontSize: "0.65rem", height: 18 }}
                      />
                    )}
                  </Box>
                </TableCell>

                {/* Register No */}
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontFamily="monospace"
                  >
                    {app.student.registerNumber}
                  </Typography>
                </TableCell>

                {/* Department */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {app.student.department}
                  </Typography>
                </TableCell>

                {/* CGPA */}
                <TableCell align="center">
                  {app.student.cgpa !== null ? (
                    <Chip
                      label={app.student.cgpa?.toFixed(2) ?? "—"}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: "divider",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      —
                    </Typography>
                  )}
                </TableCell>

                {/* Skills */}
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      flexWrap: "wrap",
                      maxWidth: 240,
                    }}
                  >
                    {app.student.skills.slice(0, 4).map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        sx={{
                          bgcolor: "rgba(99,102,241,0.1)",
                          color: currentTheme.palette.text.primary,
                          border: "1px solid rgba(99,102,241,0.25)",
                          fontSize: "0.7rem",
                          height: 20,
                        }}
                      />
                    ))}
                    {app.student.skills.length > 4 && (
                      <Tooltip
                        title={app.student.skills.slice(4).join(", ")}
                        arrow
                        placement="top"
                      >
                        <Chip
                          label={`+${app.student.skills.length - 4}`}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            height: 20,
                            bgcolor: "rgba(255,255,255,0.05)",
                          }}
                        />
                      </Tooltip>
                    )}
                    {app.student.skills.length === 0 && (
                      <Typography variant="body2" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Status */}
                <TableCell align="center">
                  {isUpdating ? (
                    <CircularProgress size={20} thickness={4} />
                  ) : (
                    <Select
                      value={app.status}
                      size="small"
                      onChange={(e: SelectChangeEvent) =>
                        onStatusChange(
                          app.id,
                          e.target.value as ApplicationStatus,
                          app.student.name,
                        )
                      }
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        minWidth: 130,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "divider",
                        },
                        "& .MuiSelect-select": {
                          py: 0.75,
                          px: 1.5,
                        },
                      }}
                      renderValue={(value) => (
                        <Chip
                          label={value}
                          size="small"
                          color={STATUS_CHIP_COLOR[value as ApplicationStatus]}
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            cursor: "pointer",
                          }}
                        />
                      )}
                    >
                      {ALL_STATUSES.map((s) => (
                        <MenuItem
                          key={s}
                          value={s}
                          sx={{ fontSize: "0.85rem", fontWeight: 600 }}
                        >
                          <Chip
                            label={s}
                            size="small"
                            color={STATUS_CHIP_COLOR[s]}
                            sx={{ fontWeight: 700, fontSize: "0.75rem", mr: 1 }}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>

                {/* Applied On */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(app.appliedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
