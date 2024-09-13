import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useState, useEffect, useMemo, lazy, Suspense } from "react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import HistoryIcon from "@mui/icons-material/History";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import PaginationItem from "@mui/material/PaginationItem";
import "./MindMap.css";
import makeStyles from "@mui/styles/makeStyles";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import { Chip, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import Swal from "sweetalert2/dist/sweetalert2";
import { useMediaQuery, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import { useOrgContext } from "context/OrgContext";
import { useApiCall } from "components/common/appHooks.js";
import { usePlanContext } from "context/PlanContext";
import InboxIcon from "@mui/icons-material/Inbox";
import {
	PLANS_LIMIT_REACHED,
	PLAN_UNLIMITED,
} from "components/common/constants";
import { useUserContext } from "context/UserContext";
import { DialogLoader, SmallLoader } from "components/common/NewLoader";
import { fromUnixTime } from "date-fns";
import ReadMoreLess from "components/common/ReadMoreLess";
import mindMapData from "staticData/mindmap.json";
import { Visibility } from "@mui/icons-material";
import zIndex from "@mui/material/styles/zIndex";
import { useResponsiveContext } from "context/ResponsiveContext";
import { useNavContext } from "context/NavContext";
import BannerImage from "../../assets/images/image 1.png";

const VectorData = lazy(() => import("./VectorData"));
const CustomNoRowsOverlay = lazy(
	() => import("components/common/CustomNoRowsOverlay")
);
const GroundTruthDialog = lazy(() => import("./GroundTruth/GroundTruthDialog"));
const BucketsDialog = lazy(() => import("./Buckets/BucketsDialog"));
const ViewTrainingStatusDialog = lazy(
	() => import("./ViewTrainingStatusDialog")
);
const AddDataDialog = lazy(() => import("./AddDataDialog"));
const EditDataDialog = lazy(() => import("./EditDataDialog"));

const useStyles = makeStyles((theme) => ({
	table: {
		maxWidth: 1600,
		// "& .MuiTableCell-root": {
		// 	padding: "14px",
		// },
		"& thead th": {
			position: "sticky",
			top: 0,
			color: "var(--white)",
			backgroundColor: "var(--primary)",
			fontWeight: "bold",
		},
		"& tbody tr:nth-child(even)": {
			backgroundColor: " #2872FA14",
			color: "var(--color5)",
		},
	},
	loading: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100px",
	},
	titleContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "column",
		// margin: "16px auto",
		// height: "500px",
		// maxHeight: "1600px",
		// backgroundColor: "green",
		// maxWidth: 1200,
		"@media (max-width: 600px)": {
			// height: "500px",
			justifyContent: "space-around",
			alignItems: "center",
			height: "600px",
		},
	},
	pagination: {
		margin: "10px auto",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	tableRow: {
		whiteSpace: "break-spaces",
	},
	action_box: {
		display: "flex",
		// justifyContent: "center",
		alignItems: "center",
		flexWrap: "wrap",
		gap: "0.5rem",
		// backgroundColor: "red",
		height: "100vh",
		width: "100%",
		// marginBottom: "0.5rem",
		"@media (max-width: 600px)": {
			height: "120vh",
			background: "#2872FA",
			// justifyContent: "",
			flexDirection: "column",
			gap: "15px",
			width: "100%",
			position: "relative",
			top: "0px",
		},
	},
	search_container: {
		display: "flex",
		// flexWrap: "wrap",
		justifyContent: "space-around",
		alignItems: "center",
		// backgroundColor: "yellow",
		width: "1240px",
		height: "88px",
		padding: "0 100px",
		gap: "20px",
		marginBottom: "50px",
		"@media (max-width: 600px)": {
			minHeight: "240px",
			width: "344px",
			background: "white",
			position: "relative",
			top: "-120px",
			flexDirection: "column",
			justifyContent: "space-evenly",
			alignItems: "center",
			gap: "10px",
			padding: "20px 20px",
			marginTop: "10px",
			zIndex: "1",
			borderRadius: "10px",
			border: "1px solid rgba(0,0,0,0.2)",
			boxShadow: "0px 4px 8px 0px rgba(0,0,0,0.2)",
			marginBottom: "0",
			// transition: "box-shadow 0.3s ease",
		},
	},
}));

const MindMap = () => {
	const { Post, Get } = useApiCall();
	const classes = useStyles();
	const {
		user: { is_god },
	} = useUserContext();
	const { org } = useOrgContext();
	const { plan } = usePlanContext();
	const theme = useTheme();
	const isSmScreen = useMediaQuery(theme.breakpoints.down("sm"));

	const [data, setData] = useState([]);

	const [openGroundTruthDialog, setOpenGroundTruthDialog] = useState(false);
	const [openBucketsDialog, setOpenBucketsDialog] = useState(false);

	const location = useLocation();
	const { search } = location;
	const query = useMemo(() => new URLSearchParams(search), [search]);
	const page = Number(query.get("page")) || 1;
	const sortBy = Number(query.get("sort_by")) || undefined;
	const order = Number(query.get("order")) || undefined;

	const [count, setCount] = useState(0);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [hasSearched, setHasSearched] = useState(false);

	const { OptionActive } = useNavContext();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
	} = useForm({
		defaultValues: {
			q: "",
			numResults: 3,
		},
	});

	// Edit Dialog
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editData, setEditData] = useState(null);

	// Add Dialog
	const [openAddDialog, setOpenAddDialog] = useState(false);
	// Tasks
	const [openTasksDialog, setOpenTasksDialog] = useState(false);
	const fetchData = async ({ per_page = 10 } = {}) => {
		try {
			setLoading(true);
			// const response = await Get(1, "view_vectors", {
			// 	page,
			// 	per_page,
			// 	sortBy: sortBy || undefined,
			// 	order: order || undefined,
			// });
			setData(mindMapData[page].data.data);
			setTotal(mindMapData[page].data.total);
			setCount(mindMapData[page].data.last_page);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching data:", error);
			setLoading(false);
		}
	};

	async function clearResults() {
		setHasSearched(false);
		resetForm(undefined, { keepDefaultValues: true });
		fetchData();
	}

	async function handleOpenGroundTruthDialog() {
		setOpenGroundTruthDialog(true);
	}
	async function handleOpenBucketsDialog() {
		setOpenBucketsDialog(true);
	}
	async function searchVectors({ q, numResults }) {
		try {
			setLoading(true);
			const response = await Post(1, "search_vectors", {
				q,
				num_results: numResults,
			});
			setData(response.data.data);
			setHasSearched(true);
			setCount(1);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	}

	// TODO: disabled from backend
	// const handleSort = useCallback((column) => {
	// 	setData([]);
	// 	const searchParams = new URLSearchParams(search);
	// 	switch (searchParams.get("order")) {
	// 		case "desc":
	// 			searchParams.set("order", "asc");
	// 			break;
	// 		case "asc":
	// 			searchParams.delete("order");
	// 			break;
	// 		default:
	// 			searchParams.set("order", "desc");
	// 			break;
	// 	}
	// 	searchParams.set("page", 1);
	// 	searchParams.set("sort_by", column);
	// 	history.push({ search: searchParams.toString() });
	// }, []);

	const columns = useMemo(
		() => [
			{
				field: "data",
				headerName: "Data",
				align: "left",
				headerAlign: "left",
				flex: 1,
				filterable: false,
				renderCell: (params) => (
					<Box sx={{ py: 2, px: 1 }}>
						<ReadMoreLess height={50}>
							{params.row.metadata.text}
							{params.row.metadata.read_more_link ? (
								<>
									{" "}
									<a
										style={{ textDecoration: "underline" }}
										target="_blank"
										href={params.row.metadata.read_more_link}
										rel="noreferrer"
									>
										{params.row.metadata?.read_more_label || "Read More"}
									</a>
								</>
							) : (
								""
							)}
						</ReadMoreLess>
					</Box>
				),
			},
			{
				field: "source",
				headerName: "Source",
				align: "center",
				headerAlign: "center",
				filterable: false,
				renderCell: (params) => {
					try {
						new URL(params.row.metadata.source_url);
						return (
							<Typography
								variant="subtitle2"
								component="a"
								href={params.row.metadata.source_url}
								target="_blank"
								rel="noopener noreferrer"
								style={{ textDecoration: "underline" }}
							>
								Open Link
							</Typography>
						);
					} catch (error) {
						return <Typography variant="subtitle2">--</Typography>;
					}
				},
			},
			...(hasSearched
				? [
						{
							field: "score",
							headerName: "Score",
							align: "center",
							headerAlign: "center",
							filterable: true,
							renderCell: (params) => (
								<Typography variant="subtitle2">{params.row.score}</Typography>
							),
						},
					]
				: []),
			{
				field: "type",
				headerName: "Type",
				align: "center",
				headerAlign: "center",
				filterable: true,
				renderCell: (params) => (
					// TODO: Add color for diffrent types
					<Chip
						label={params.row.metadata.source_type}
						variant="outlined"
						color="primary"
						size="small"
					/>
				),
			},
			{
				field: "created_at",
				headerName: "Created At",
				align: "center",
				headerAlign: "center",
				filterable: true,
				renderCell: (params) => (
					<Typography variant="subtitle2">
						{fromUnixTime(
							params.row?.metadata?.created_at
						).toLocaleDateString()}
					</Typography>
				),
			},
			// {
			// 	id: "read_more_link",
			// 	label: "Link",
			// },
			// {
			// 	id: "updated_at",
			// 	label: "Updated At",
			// },
			// { id: "read_more_link", label: "Link" },
			// { id: "updated_at", label: "Updated At" }
			{
				field: "actions",
				headerName: "Actions",
				align: "center",
				headerAlign: "center",
				filterable: false,
				renderCell: (params) => (
					<>
						<IconButton
							color="primary"
							onClick={() => handleOpenEditDialog(params.row)}
						>
							<EditIcon />
						</IconButton>
						<IconButton
							color="secondary"
							onClick={() => handleDelete(params.row.vector_id)}
						>
							<DeleteIcon />
						</IconButton>
					</>
				),
			},
		],
		[hasSearched]
	);

	const handleOpenEditDialog = async (data) => {
		setEditData(data);
		// setEditDescription(description);
		setOpenEditDialog(true);
	};

	const handleCloseEditDialog = async () => {
		setOpenEditDialog(false);
		setEditData(null);
	};
	async function handleDelete(id) {
		try {
			const result = await Swal.fire({
				title: "Confirmation",
				text: "Are you sure you want to delete this data?",
				icon: "warning",
				showCancelButton: true,
			});

			if (result.isConfirmed) {
				// Call your delete API endpoint with the necessary parameters
				await Post(1, "delete_vector", { vector_id: id });

				// Update the originally mapped data
				setData((prevData) => prevData.filter((item) => item.vector_id !== id));

				toast.success("Data has been deleted");
			}
		} catch (error) {
			console.error("Error deleting data:", error);
			toast.error("Failed to delete data.");
		}
	}

	const handleOpenAddDialog = async () => {
		if (plan.training !== PLAN_UNLIMITED && total >= plan.training && !is_god) {
			return toast.info(PLANS_LIMIT_REACHED);
		}
		setOpenAddDialog(true);
	};
	const handleOpenTasksDialog = async () => {
		setOpenTasksDialog(true);
	};

	useEffect(() => {
		setData([]);
		// setCount(0);
		fetchData();
		// return addBeyondChat();
	}, [org.host_url, page, order, sortBy]);
	const getRowId = (row) => row.vector_id; // Assuming vector_id is the unique identifier for each row

	return (
		<>
			{/* pura form element tk */}
			<div className={classes.titleContainer}>
				{/* sirf 3 button */}
				<Box className={classes.action_box}>
					{isSmScreen ? (
						<Box
							sx={{
								"@media (max-width: 600px)": {
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: "15px",
									// background: "red",
									position: "absolute",
									top: "50px",
								},
							}}
						>
							<Button
								variant="contained"
								sx={{
									"@media (max-width:600px)": {
										backgroundColor: "#191A23",
										width: "250px",
										height: "60px",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										borderRadius: "50px",
									},
								}}
								startIcon={
									<AddCircleIcon
										sx={{
											"@media (max-width:600px)": {
												fontSize: 40,
												minWidth: "40px",
												height: "40px",
											},
										}}
									/>
								} // Make the AddIcon larger
								onClick={handleOpenAddDialog}
							>
								<Typography
									variant="h6"
									component="span"
									align="center"
									sx={{
										fontSize: {
											xs: "24px", // Font size for extra-small screens (e.g., max-width: 600px)
											sm: "12px", // Font size for small screens and above (e.g., min-width: 600px)
										},
									}}
								>
									Add Data
								</Typography>
							</Button>

							<Button
								variant="contained"
								startIcon={<HistoryIcon />}
								sx={{
									"@media( max-width : 600px)": {
										background: "white",
										color: "black",
										borderRadius: "50px",
										width: "193px",
									},
								}}
								onClick={handleOpenTasksDialog}
							>
								<Typography variant="h6" component="span" align="center">
									Data Training Status
								</Typography>
							</Button>
							<Button
								variant="outlined"
								sx={{
									"@media( max-width : 600px)": {
										background: "white",
										color: "black",
										borderRadius: "50px",
										width: "163px",
									},
								}}
								startIcon={<QuestionAnswerIcon />}
								onClick={handleOpenGroundTruthDialog}
							>
								<Typography variant="h6" component="span" align="center">
									Ground Truths
								</Typography>
							</Button>
							{is_god ? (
								<Button
									variant="outlined"
									startIcon={<InboxIcon />}
									onClick={handleOpenBucketsDialog}
								>
									<Typography variant="h6" component="span" align="center">
										Buckets
									</Typography>
								</Button>
							) : null}
						</Box>
					) : (
						<>
							{/* for pc */}
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",

									gap: "20px",
									width: "100%",
									margin: "30px 70px 70px 80px",
									alignItems: "start",
									justifyContent: "center",
									minHeight: "515px",
									// backgroundColor: "red",
								}}
							>
								<Box
									sx={{
										// background: "green",
										display: "flex",
										flexDirection: "column",
										gap: "50px",
									}}
								>
									<Typography
										style={{
											fontSize: "70px",
											fontWeight: "medium",
											maxWidth: "631px",
											lineHeight: "95px",
										}}
									>
										Mastering the Core of Chatbot Intelligence
									</Typography>
									<Typography
										style={{
											fontSize: "19px",
											maxWidth: "498px",
											minHeight: "84px",
											textAlign: "left",
										}}
									>
										{OptionActive?.explanation}
									</Typography>
									<Box
										style={{
											display: "flex",
											// justifyContent: "space-between",
											gap: "20px",
										}}
									>
										<Button
											variant="contained"
											startIcon={<AddCircleIcon />}
											onClick={handleOpenAddDialog}
											style={{
												width: "150px",
											}}
										>
											Add Data
										</Button>
										<Button
											variant="contained"
											startIcon={<HistoryIcon />}
											onClick={handleOpenTasksDialog}
											style={{
												background: "white",
												color: "black",
												fontWeight: "bold",
												border: "2px solid #2871fab0 ",

												// width:"150px",
											}}
										>
											Data Training Status
										</Button>
										<Button
											variant="contained"
											startIcon={<QuestionAnswerIcon />}
											onClick={handleOpenGroundTruthDialog}
											style={{
												background: "white",
												color: "black",
												fontWeight: "bold",
												border: "2px solid #2871faae ",
												"&:hover": {
													boxShadow: " 0 0 10px 1px #2872FA",
												},
												// width:"150px",
											}}
										>
											Ground Truths
										</Button>
										{is_god ? (
											<Button
												variant="contained"
												startIcon={<InboxIcon />}
												onClick={handleOpenBucketsDialog}
											>
												Buckets
											</Button>
										) : null}
									</Box>
								</Box>
								<Box sx={{ margin: "0 auto" }}>
									{/* <BannerImage /> */}
									<img
										src={BannerImage}
										alt="Banner Image"
										style={{
											width: "100%",
											height: "100%",
										}}
									></img>
								</Box>
							</Box>
						</>
					)}
				</Box>

				<form
					onSubmit={handleSubmit(searchVectors)}
					className={classes.search_container}
				>
					<TextField
						label="Search"
						error={errors?.q?.type}
						helperText={errors?.q?.message}
						size="small"
						sx={
							!isSmScreen && {
								"& .MuiInputLabel-root": {
									left: "10%", // Moves the label horizontally to the center
									transform: "translate(-50%, 18px) scale(1)", // Centers it and adjusts the label position
									transition: "transform 0.2s ease-in-out", // Smooth transition for label movement
								},
								"& .MuiInputLabel-shrink": {
									transform: "translate(-80%, -10px) scale(0.75)", // Adjusts position when label is shrunk
								},
								"& .MuiOutlinedInput-root": {
									"& input": {
										padding: "18px 14px", // Adjust padding inside input
									},
									"& fieldset": {
										borderRadius: "20px", // Rounded corners
									},
								},
							}
						}
						InputProps={
							!isSmScreen
								? {
										style: {
											width: "685px",
											height: "67px",
										},
									}
								: {
										style: {
											width: "300px",
											height: "40px",
										},
									}
						}
						{...register("q", {
							required: "Required",
						})}
					/>

					<TextField
						select
						label="Results"
						defaultValue={3}
						sx={{}}
						InputProps={
							!isSmScreen
								? {
										style: {
											// border: "2px solid black", // Regular border
											width: "180px",
											height: "67px",
											borderRadius: "20px",
										},
									}
								: {
										style: {
											width: "300px",
											height: "40px",
										},
									}
						}
						{...register("numResults")}
					>
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50].map((value) => (
							<MenuItem key={value} value={value}>
								{value}
							</MenuItem>
						))}
					</TextField>

					<Button
						type="submit"
						variant="contained"
						sx={
							!isSmScreen
								? {
										width: "137px",
										background: "#2872FA",
										height: "60px",
										borderRadius: "20px",
									}
								: {
										width: "300px",
										height: "40px",
									}
						}
					>
						Search
					</Button>
					{hasSearched ? (
						<Button
							color="secondary"
							variant="outlined"
							sx={{ my: 1 }}
							onClick={clearResults}
						>
							Clear Results
						</Button>
					) : null}
				</form>
			</div>

			<Box
				sx={{
					"@media (max-width:600px)": {
						padding: "10px",
						borderRadius: "8px",
						height: "100%",
						// background: "blue",
						position: "relative",
						top: "-85px",
					},
				}}
			>
				{isSmScreen ? (
					loading ? (
						<SmallLoader />
					) : (
						<Suspense fallback={<SmallLoader />}>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: "20px",
									padding: "0 10px",
								}}
							>
								{data.map((item) => (
									<div
										key={item.vector_id}
										style={{
											border: "1px solid rgba(0,0,0,0.2)",
											boxShadow: "0px 4px 8px 0px rgba(0,0,0,0.2)",
											borderRadius: "10px",
										}}
									>
										<VectorData
											data={item}
											handleOpenEditDialog={handleOpenEditDialog}
											handleDelete={handleDelete}
										/>
									</div>
								))}
							</Box>
						</Suspense>
					)
				) : (
					<Box
						sx={{
							width: "100%",
							minWidth: "960px",
							padding: "0 60px",
							borderRadius: "25px",
						}}
						style={{ borderRadius: "25px" }}
					>
						<DataGrid
							rows={data}
							columns={columns}
							loading={loading}
							autoHeight
							sx={{
								background: "#DAE1EC",
								borderRadius: "25px",
								padding: "10px 25px",
								borderBottom: "1px solid black",
							}}
							getRowId={getRowId}
							slots={{
								noRowsOverlay: CustomNoRowsOverlay,
							}}
							slotProps={{
								noRowsOverlay: {
									title:
										"Looks like you have not added any data, click on the Add Data Button above",
								},
								loadingOverlay: {
									title: "Loading...",
								},
							}}
							disableSelectionOnClick
							disableRowSelectionOnClick
							hideFooter
							getRowHeight={() => "auto"}
						/>
					</Box>
				)}

				<Stack spacing={2} alignItems="center" my={2}>
					<Pagination
						page={page}
						count={count}
						sx={{ margin: "32px 0", padding: "16px 0" }}
						// style={{backgroundColor: "black"}}
						color="primary"
						renderItem={(item) => {
							const searchParams = new URLSearchParams(location.search);
							searchParams.set("page", item.page);
							return (
								<PaginationItem
									component={Link}
									to={`${location.pathname}?${searchParams.toString()}`}
									{...item}
								/>
							);
						}}
					/>
				</Stack>
			</Box>

			<Suspense fallback={<></>}>
				<AddDataDialog {...{ openAddDialog, setData, setOpenAddDialog }} />
			</Suspense>
			<Suspense fallback={<></>}>
				<ViewTrainingStatusDialog
					{...{ openTasksDialog, setOpenTasksDialog }}
				/>
			</Suspense>
			<Suspense fallback={<DialogLoader />}>
				{openEditDialog && editData ? (
					<EditDataDialog
						{...{
							editData,
							setData,
							openEditDialog,
							setOpenEditDialog,
							handleCloseEditDialog,
						}}
					/>
				) : null}
			</Suspense>
			<Suspense fallback={<DialogLoader />}>
				{openGroundTruthDialog ? (
					<GroundTruthDialog
						{...{
							openGroundTruthDialog,
							setOpenGroundTruthDialog,
						}}
					/>
				) : null}
			</Suspense>
			<Suspense fallback={<DialogLoader />}>
				{openBucketsDialog ? (
					<BucketsDialog
						{...{
							openBucketsDialog,
							setOpenBucketsDialog,
						}}
					/>
				) : null}
			</Suspense>
		</>
	);
};

export default withErrorBoundary(MindMap, "MindMap");
