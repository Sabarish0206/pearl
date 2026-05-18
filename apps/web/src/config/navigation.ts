import type { SvgIconComponent } from "@mui/icons-material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import type { AuthUser } from "@pearl/common";

export interface NavLink {
  text: string;
  path: string;
  icon: SvgIconComponent;
  roles: AuthUser["role"][];
}

export const NAV_LINKS: NavLink[] = [
  // Shared
  {
    text: "Dashboard",
    path: "/dashboard",
    icon: DashboardIcon,
    roles: ["STUDENT", "ADMIN", "FACULTY"],
  },

  // Student routes
  {
    text: "My Profile",
    path: "/student/profile",
    icon: PersonIcon,
    roles: ["STUDENT"],
  },
  {
    text: "Browse Drives",
    path: "/student/jobs",
    icon: WorkIcon,
    roles: ["STUDENT"],
  },
  {
    text: "My Applications",
    path: "/student/applications",
    icon: AssignmentIcon,
    roles: ["STUDENT"],
  },
  {
    text: "My Resume",
    path: "/resume",
    icon: DescriptionIcon,
    roles: ["STUDENT"],
  },

  // Admin & Faculty routes
  {
    text: "My Profile",
    path: "/admin/profile",
    icon: PersonIcon,
    roles: ["ADMIN", "FACULTY"],
  },
  {
    text: "Job Drives",
    path: "/admin/jobs",
    icon: WorkIcon,
    roles: ["ADMIN", "FACULTY"],
  },
  {
    text: "Create Drive",
    path: "/admin/jobs/new",
    icon: AddIcon,
    roles: ["ADMIN", "FACULTY"],
  },
  {
    text: "Talent Directory",
    path: "/admin/talent-directory",
    icon: PeopleIcon,
    roles: ["ADMIN", "FACULTY"],
  },
];
