// import ClickAwayListener from "@mui/material/ClickAwayListener";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect, useMemo } from "react";
import { withRouter, useHistory, matchPath } from "react-router-dom";
// import "../../assets/css/User/Navbar/dashboardNavBar.css";
import styles from "./NavBar.module.css";
// import { useEffect } from "react";
import classNames from "classnames";
import {
	KeyboardArrowDown,
	RadioButtonChecked,
	RadioButtonUnchecked,
} from "@mui/icons-material";
import {
	AppBar,
	Avatar,
	Box,
	Button,
	FormControlLabel,
	IconButton,
	Menu,
	MenuItem,
	Switch,
	Toolbar,
	Tooltip,
	Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info";
import EditLocationAltOutlinedIcon from "@mui/icons-material/EditLocationAltOutlined";
import { useUserContext } from "context/UserContext";
import { useOrgContext } from "context/OrgContext";
import MetaHelmet from "components/common/MetaHelmet";
import { useResponsiveContext } from "context/ResponsiveContext";
import { ClassNames } from "@emotion/react";
import { useNavContext } from "context/NavContext";
const useStyles2 = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
	},
	arrowDown: {
		color: "var(--primary)",
		marginLeft: "0.15rem",
	},
	org: {
		display: "flex",
		alignItems: "center",
		// padding: "0.5rem 1rem",
		cursor: "pointer",
		color: "var(--primary)",
		borderRadius: 8,
		// border: "1px solid green",
		"&:hover": {
			backgroundColor: "#f6f2f2",
		},
	},
	orgName: {
		color: "",
		position: "absolute",
		right: "30px",
	},
	radio: {
		color: "var(--primary)",
		marginRight: "0.5rem",
		fontSize: "1.2rem",
	},
	noOrg: {
		color: "var(--color5)",
		fontSize: "0.82rem",
		fontWeight: "400",
		height: "100%",
		display: "flex",
		width: "180px",
		padding: "0.5rem 1rem",
		lineHeight: "1.5",
	},
	loader: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "250px",
		position: "relative",
		width: "180px",
	},
	orgBtn: {
		// border: "1px solid red",
		outline: "none",
		color: "white",
		borderRadius: "0rem",
		// right:" 55px !important",
		"&:hover": {
			backgroundColor: "transparent",
		},
	},
	orgSelector: {
		top: "51px !important",
		right: "45px !important",
		maxHeight: "80vh",
		overflowY: "scroll",
	},
	navOptionsContainer: {
		padding: "8px",
		display: "Flex",
		gap: "10px",
		alignItems: "center",
		color: "black",
		cursor: "pointer",
		borderRadius: 8,
		"&:hover": {
			backgroundColor: "#f6f2f2",
		},
	},
	tutorialStart: {
		cursor: "pointer",
	},
	ToolbarMindMap: {
		// background: "blue",

		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		padding: "0 4em",
		border: "none",
		boxShadow: "none",
		"@media (max-width : 600px)": {
			padding: "0 16px",
		},
	},
	mindMapStyle: {
		minHeight: "85px",
	},
}));

const NavBar = (props) => {
	const classes = useStyles2();
	// const [isDesktopBarOpened, setIsDesktopBarOpened] = useState(false);
	// const [isOrgSelectorOpened, setIsOrgSelectorOpened] = useState(false);
	const [anchorElUser, setAnchorElUser] = React.useState(null);
	const [anchorElOrg, setAnchorElOrg] = React.useState(null);
	const { isMobile } = useResponsiveContext();
	const { OptionActive, setOptionActive } = useNavContext();

	const {
		user: { access_token, email, name, is_god },
		setUser,
	} = useUserContext();
	const {
		orgs,
		org: { host_url },
	} = useOrgContext();
	const currOrgName = useMemo(
		() =>
			orgs.filter((org) => org?.host_url === decodeURIComponent(host_url))?.[0]
				?.name,
		[host_url, orgs]
	);

	// const showDesktopProfile = () => {
	// 	setIsDesktopBarOpened(true);
	// };

	// const hideDesktopProfile = () => {
	// 	setIsDesktopBarOpened(false);
	// };
	// const showOrgSelector = () => {
	// 	setIsOrgSelectorOpened(true);
	// };

	// const hideOrgSelector = () => {
	// 	setIsOrgSelectorOpened(false);
	// };

	const handleOptionChange = (newOption) => {
		setOptionActive(newOption);
	};

	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};
	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};
	const handleOpenOrgMenu = (event) => {
		setAnchorElOrg(event.currentTarget);
	};
	const handleCloseOrgMenu = () => {
		setAnchorElOrg(null);
	};
	async function handleToggleGodMode() {
		setUser((prev) => ({ ...prev, is_god: !prev.is_god }));
	}
	const activeOption = props.navOptions.find(
		(option) => option.isActive === true
	);
	useEffect(() => {
		if (activeOption && activeOption.tourHeading) {
			setOptionActive(activeOption);
			// console.log("Setting OptionActive to:", activeOption.tourHeading);
		} else {
			console.log("No activeOption found");
		}
	}, [activeOption, setOptionActive]);

	// Log OptionActive after it updates
	// useEffect(() => {
	// 	// console.log("Updated OptionActive:", OptionActive);
	// }, [OptionActive]);
	return (
		<>
			<MetaHelmet
				title={activeOption?.tourHeading}
				description={activeOption?.explanation}
			/>
			<AppBar
				position="fixed"
				className={classNames(styles.navbar, {
					[styles.logged_in]: access_token && !isMobile,
					[styles.mindMapStyle]:
						activeOption?.tourHeading === "Chatbot Mind Map",
				})}
				// sx={{
				// 	...(activeOption?.tourHeading === "Chatbot Mind Map" && {
				// 		backgroundColor: "blue",
				// 		border: "1px solid #ccc",
				// 		marginTop: "30px",
				// 	}),
				// }}
				style={{
					...(activeOption?.tourHeading === "Chatbot Mind Map" && {
						// backgroundColor: "blue",
						border: "1px solid #ccc",
						minHeight: "85px",
						// marginTop: "30px",
					}),
				}}
			>
				<Toolbar
					disableGutters
					sx={{
						...(isMobile && {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							width: "100%",
							padding: "0 8px",
							gap: "10px",
						}),
					}}
					className={
						activeOption?.tourHeading === "Chatbot Mind Map" &&
						classes.ToolbarMindMap
					}
				>
					{access_token && isMobile ? (
						<Box>
							<IconButton
								onClick={props.toggleLeftNav}
								sx={{
									// Default styles that will apply for mobile screens
									"@media (max-width: 600px)": {
										color: "white",
										fontSize: "28px",
									},
								}}
								className={
									activeOption?.tourHeading === "Chatbot Mind Map" &&
									classes.MenuIcon
								}
							>
								<MenuIcon style={{ fontSize: "28px" }} />
							</IconButton>
						</Box>
					) : null}
					<Box>
						<Typography
							variant="h1"
							noWrap
							sx={{
								color: "black",
								display: "flex",
								alignItems: "center",
								gap: 1,
								"@media (max-width: 600px)": {
									color: "white",
									fontSize: "18px",
								},
								...(activeOption?.tourHeading === "Chatbot Mind Map" && {
									fontSize: "38px",
									fontWeight: "bold",
									textTransform: "uppercase",
								}),
								// fontSize: "28px",
							}}
						>
							{activeOption?.tourHeading ?? "BeyondChats"}
							{/* this is the content of explanation  */}
							{activeOption?.explanation ? (
								<Tooltip title={activeOption?.explanation}>
									<InfoIcon
										sx={{
											display: {
												xs: "inline-block",
												md: "none",
												fontSize: "18px",
											},
										}}
										color=""
									/>
								</Tooltip>
							) : (
								<></>
							)}
						</Typography>
						<Typography
							variant="subtitle2"
							sx={{
								color: "black",
								fontWeight: 400,
								display: { xs: "none", md: "block", maxWidth: "500px" },
								...(activeOption?.tourHeading === "Chatbot Mind Map" && {
									display: "none",
								}),
							}}
						>
							{activeOption?.explanation}
						</Typography>
					</Box>

					<Box sx={{ flexGrow: 0, gap: 2, display: "flex" }}>
						{access_token ? (
							<>
								{is_god ? (
									<FormControlLabel
										control={
											<Switch
												checked={is_god}
												onChange={handleToggleGodMode}
												label="God Mode?"
											/>
										}
										sx={{ color: "black" }}
										label="God Mode?"
									/>
								) : null}

								{!isMobile ? (
									<Button
										variant="outlined"
										onClick={() => props.setShowStartTutorial(true)}
									>
										<Typography variant="h6">Guided Tour</Typography>
									</Button>
								) : null}
								{/* ORG Selector */}
								<Tooltip title="View Orgs">
									<Button
										variant="text"
										disableFocusRipple
										disableTouchRipple
										classes={{
											root: classes.orgBtn,
										}}
										endIcon={<KeyboardArrowDown />}
										onClick={handleOpenOrgMenu}
										style={{ position: "relative", right: "0px" }}
									>
										<Typography
											variant="h5"
											component="div"
											className={classes.orgName}
										>
											{currOrgName ?? <EditLocationAltOutlinedIcon />}
										</Typography>
										{/* <KeyboardArrowDown
											classes={{
												root: classes.arrowDown,
											}}
										/> */}
									</Button>
								</Tooltip>
								{!isMobile ? (
									<>
										<Menu
											sx={{ mt: "45px", color: "white" }}
											id="menu-appbar"
											anchorEl={anchorElOrg}
											anchorOrigin={{
												vertical: "top",
												horizontal: "right",
											}}
											keepMounted
											transformOrigin={{
												vertical: "top",
												horizontal: "right",
											}}
											open={Boolean(anchorElOrg)}
											onClose={handleCloseOrgMenu}
										>
											{orgs?.length > 0 ? (
												orgs.map((org, index) => (
													<Org
														org={org}
														key={index}
														handleCloseOrgMenu={handleCloseOrgMenu}
													/>
												))
											) : (
												<p className={classes.noOrg}>
													You are not a part of any organization
												</p>
											)}
										</Menu>
										<Tooltip title="Open Menu">
											<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
												<Avatar
													alt={name}
													src={`https://api.dicebear.com/5.x/micah/svg?seed=${email}`}
													sx={{ boxShadow: "0px 0px 0px 2px var(--primary)" }}
												/>
											</IconButton>
										</Tooltip>
									</>
								) : null}
								{/* Pages Available */}
								<Menu
									sx={{ mt: "45px" }}
									anchorEl={anchorElUser}
									anchorOrigin={{
										vertical: "top",
										horizontal: "right",
									}}
									keepMounted
									transformOrigin={{
										vertical: "top",
										horizontal: "right",
									}}
									open={Boolean(anchorElUser)}
									onClose={handleCloseUserMenu}
								>
									{props.navOptions.map(({ title, Icon, onClick }) => (
										<MenuItem
											key={title}
											onClick={() => {
												onClick();
												handleCloseUserMenu();
											}}
											className={classes.navOptionsContainer}
										>
											<Icon />

											<Typography textAlign="center">{title}</Typography>
										</MenuItem>
									))}
								</Menu>
							</>
						) : null}
					</Box>
				</Toolbar>
			</AppBar>
			<Toolbar />
			{/* <div
				className={classNames(`navbar`, {
					logged_in: access_token,
				})}
			>
				<div className="nav-logo">
					<Link to="/">BeyondChats Admin Dashboard</Link>
				</div>

				{access_token ? (
					<div className="nav-profile">
						<div className={"Nav-div " + classes.tutorialStart}>
							<Button
								variant="outlined"
								onClick={() => props.setShowStartTutorial(true)}
							>
								<Typography variant="h6">Guided Tour</Typography>
							</Button>
						</div>
						<div className={"Nav-div"}>
							<ClickAwayListener
								onClickAway={() => {
									if (isDesktopBarOpened) hideOrgSelector();
								}}
							>
								<div
									className="Nav"
									onMouseLeave={hideOrgSelector}
									onClick={showOrgSelector}
									onMouseEnter={showOrgSelector}
								>
									<Button
										variant="text"
										disableFocusRipple
										disableTouchRipple
										className={`profileNavBtn ${
											isDesktopBarOpened ? "profileNavBtnBack" : ""
										}`}
										classes={{
											root: classes.orgBtn,
										}}
									>
										<Typography
											variant="h5"
											component="div"
											className={classes.orgName}
										>
											{currOrgName ?? "Select Org"}
										</Typography>
										<KeyboardArrowDown
											classes={{
												root: classes.arrowDown,
											}}
										/>
									</Button>

									<div
										className={classNames(
											"DesktopProfileViewer",
											classes.orgSelector,
											{
												displayNone: !isOrgSelectorOpened,
											}
										)}
									>
										<div className="nav-hr"></div>
										{loading ? (
											<div className={classes.loader}>
												<SmallLoader
													height="220px"
													width="150px"
													text={false}
												/>
											</div>
										) : orgs?.length > 0 ? (
											orgs.map((org, index) => <Org org={org} key={index} />)
										) : (
											<p className={classes.noOrg}>
												You are not a part of any organization
											</p>
										)}
									</div>
								</div>
							</ClickAwayListener>
						</div>

						<div className={"Nav-div"}>
							<ClickAwayListener
								onClickAway={() => {
									if (isDesktopBarOpened) hideDesktopProfile();
								}}
							>
								<div
									className="Nav"
									onMouseLeave={hideDesktopProfile}
									onClick={showDesktopProfile}
									onMouseEnter={showDesktopProfile}
								>
									<div
										className={`profileNavBtn ${
											isDesktopBarOpened ? "profileNavBtnBack" : ""
										}`}
									>
										<div
											className="profile-nav-grid"
											style={{
												border: "0.1em solid var(--primary)",
											}}
										>
											<div
												className="navbar-profile-image"
												style={{
													backgroundImage: `url(https://api.dicebear.com/5.x/micah/svg?seed=${email})`,
												}}
											/>
										</div>
									</div>

									<div
										className={classNames("DesktopProfileViewer", {
											displayNone: !isDesktopBarOpened,
										})}
									>
										{props.navOptions.map(({ title, Icon, onClick }) => (
											<div
												key={title}
												className={classes.navOptionsContainer}
												onClick={onClick}
											>
												<Icon />
												<Typography variant="h5" component="div">
													{title}
												</Typography>
											</div>
										))}
									</div>
								</div>
							</ClickAwayListener>
						</div>
					</div>
				) : null}
			</div> */}
		</>
	);
};
export default withRouter(NavBar);

const Org = ({ org, handleCloseOrgMenu }) => {
	const history = useHistory();
	const classes = useStyles2();
	const { setOrg, org: currOrg } = useOrgContext();

	const match = matchPath(window.location.pathname, {
		path: "/:org/",
		exact: false,
		strict: false,
	});
	const handleOrgSelection = async () => {
		const chatPageMatch = matchPath(window.location.pathname, {
			path: "/:org/:chatId(\\d+)",
			exact: true,
			strict: false,
		});

		const url = new URL(window.location.href);
		if (chatPageMatch?.isExact) {
			url.pathname = "/";
			url.search = "";
		} else
			url.pathname = url.pathname.replace(
				match.url,
				"/" + encodeURIComponent(org.host_url)
			);
		handleCloseOrgMenu();
		history.replace(url.pathname + url.search);
		setOrg(org);
	};

	return (
		<MenuItem onClick={handleOrgSelection} className={classes.org}>
			{currOrg.host_url === org.host_url ? (
				<RadioButtonChecked className={classes.radio} />
			) : (
				<RadioButtonUnchecked className={classes.radio} />
			)}
			<Typography variant="h5" component="div" className={classes.orgName}>
				{org.name}
			</Typography>
		</MenuItem>
	);
};
