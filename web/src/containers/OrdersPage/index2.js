import React, { useState } from "react";
import ReactDOM from "react-dom";
import MUIDataTable from "mui-datatables";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import DeleteOrder from "../DeleteOrder";
import { formatNumber, stringifyOrderStatus } from "../../../helpers/formatters";
import UpdateQuotation from "../UpdateQuotation";
import moment from "moment";

import currencyFormatter from "../../../helpers/currencyFormatterPrefix";
import AddOrderPaymentModal from "src/components/OrderComponents/AddOrderPaymentModal";
import { updateOrderProcessStatus } from "../../../services/orderService";
import { Upload } from "antd";
import { useTranslation } from "react-i18next";
import { orderProcesses } from "src/hooks";
import { useContext } from "react";
import { UserContext } from "src/contexts";

const _30Days = 30 * 24 * 60 * 60 * 1000;

const ConcludedStatus = 8;

const OrderProcess = ({ id: orderId, status, paymentStatus, onUpdate, allowed }) => {
  const { t } = useTranslation(["translation"]);
  const [shouldShowReviewModal, setShouldShowReviewModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [review, setReview] = useState("");
  const handleClick = (id) => () => {
    updateOrderProcessStatus(orderId, { processStatus: id }).then(() => onUpdate());
  };

  const addReview = () => {
    updateOrderProcessStatus(orderId, {
      processStatus: ConcludedStatus,
      documents: files.map(({ response }) => response?.message),
      comment: review,
    }).then(() => onUpdate());
  };

  const handleFilesChane = ({ fileList }) => {
    setFiles(fileList);
  };

  const closeShouldShowReviewModal = () => setShouldShowReviewModal(false);
  return (
    <>
      <Dropdown text={t(orderProcesses[status])}>
        <Dropdown.Menu>
          {orderProcesses.map((label, i) => (
            <Dropdown.Item
              key={label}
              text={t(label)}
              onClick={i === ConcludedStatus ? () => setShouldShowReviewModal(true) : handleClick(i)}
              disabled={(i === ConcludedStatus && (status !== 7 || paymentStatus !== 3)) || i === 0 || !allowed.includes(i)}
            />
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {shouldShowReviewModal && (
        <Modal closeIcon open onClose={closeShouldShowReviewModal}>
          <Modal.Header>{t("Conclude with Review")}</Modal.Header>
          <Modal.Content>
            <Form>
              <div style={{ marginBottom: 16 }}>
                <Upload
                  onChange={handleFilesChane}
                  fileList={files}
                  action="/api/assets/upload?entity=order"
                  accept="image/*,.pdf"
                  headers={{
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  }}
                >
                  <Button>{t("Add files")}</Button>
                </Upload>
              </div>

              <Form.Group widths="equal">
                <Form.TextArea
                  label={t("Client Review")}
                  onChange={(e, { value }) => {
                    setReview(value);
                  }}
                />
              </Form.Group>
            </Form>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={closeShouldShowReviewModal}>Cancel</Button>
              <Button primary onClick={addReview}>
                {t("Conclude")} {t("Order")}
              </Button>
            </div>
          </Modal.Content>
        </Modal>
      )}
    </>
  );
};

const noPaymentSince30days = (order) => {
  const lastTransactionOn = (order.transactions || []).sort((a, b) => b.createdAt - a.createdAt)[0]?.createdAt;
  const lastPaymentOn = lastTransactionOn || order.createdAt;
  return [1, 2].includes(order.status) && Date.now() - lastPaymentOn * 1000 > _30Days;
};

const EstConclusionDate = ({ date, status }) => {
  if (!date) return "-";
  const dateFormatted = moment(date).format("DD/MM/YYYY");
  const diffFromToday = moment(date).diff(moment(), "day");
  let bgColor;
  let prefix;
  if (status < 7) {
    if (diffFromToday <= 0) {
      bgColor = "rgba(255, 0, 0, 0.2)";
      prefix = "🚨";
    } else if (diffFromToday > 0 && diffFromToday <= 5) {
      prefix = <span style={{ fontFamily: "Segoe UI Emoji" }}>⚠️ </span>;
      bgColor = "rgba(255, 255, 0, 0.2)";
    }
  }

  return (
    <span style={{ backgroundColor: bgColor, padding: 8 }}>
      {prefix}
      {dateFormatted}
    </span>
  );
};

const OrderList = ({
  orders,
  addToast,
  loadOrders,
  setSelectedOrders,
  selectedOrders,
  showOrderUpdateModal,

  filters,
  pages,
  onPageChange,
}) => {
  const { t } = useTranslation(["translation"]);
  const { user: admin } = useContext(UserContext);
  const [collectPaymentFor, setCollectPaymentFor] = useState(undefined);

  const [shouldShowChangeStatusModal, setShouldShowChangeStatusModal] = useState();

  const allowedOrders = (orders || []).filter(({ processStatus, client }) => {
    const r1 = (admin.allowedStatuses || []).length > 0 ? admin.allowedStatuses.includes(processStatus) : true;
    const r2 = admin.roleNumber === 6 ? client?._id === admin._id : true;
    return r1 && r2;
  });

  const updateOrderStatusProcess = () => {};

  const selectOrder = (_id) => (event) => {
    if (event.target.checked) {
      setSelectedOrders([...selectedOrders, _id]);
    } else {
      setSelectedOrders(selectedOrders.filter((sid) => sid !== _id));
    }
  };

  const handleEdit = (order) => {
    setCollectPaymentFor(order);
  };

  const closeCollectPaymentModal = () => {
    setCollectPaymentFor(undefined);
  };

  const handleAfterUpdate = () => {
    closeCollectPaymentModal();
    loadOrders();
  };

function App() {
  const [responsive, setResponsive] = useState("vertical");
  const [tableBodyHeight, setTableBodyHeight] = useState("400px");
  const [tableBodyMaxHeight, setTableBodyMaxHeight] = useState("");

  const columns = [t("ID"), t("Client"), t("Status"), t("Process Status"), t("Total Units"), t("Total Cost"), t("Total Paid"), t("Est. Conlusion"), t("Created At"), t("Last Pay date")];

  const options = {
    filter: true,
    filterType: "dropdown",
    responsive,
    tableBodyHeight,
    tableBodyMaxHeight
  };
  {allowedOrders.map((order) => {
    const shouldDeleteQuote = order.status === 4 && Date.now() - order.createdAt * 1000 > _30Days;
  const data = [
    ["Gabby George", "Business Analyst", "Minneapolis"],
    [
      "Aiden Lloyd",
      "Business Consultant for an International Company and CEO of Tony's Burger Palace",
      "Dallas"
    ],
    ["Jaden Collins", "Attorney", "Santa Ana"],
    ["Franky Rees", "Business Analyst", "St. Petersburg"],
    ["Aaren Rose", null, "Toledo"],
    ["Johnny Jones", "Business Analyst", "St. Petersburg"],
    ["Jimmy Johns", "Business Analyst", "Baltimore"],
    ["Jack Jackson", "Business Analyst", "El Paso"],
    ["Joe Jones", "Computer Programmer", "El Paso"],
    ["Jacky Jackson", "Business Consultant", "Baltimore"],
    ["Jo Jo", "Software Developer", "Washington DC"],
    ["Donna Marie", "Business Manager", "Annapolis"]
  ];

  return (
    <React.Fragment>
      <FormControl>
        <InputLabel id="demo-simple-select-label">Responsive Option</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={responsive}
          style={{ width: "200px", marginBottom: "10px", marginRight: 10 }}
          onChange={(e) => setResponsive(e.target.value)}
        >
          <MenuItem value={"vertical"}>vertical</MenuItem>
          <MenuItem value={"standard"}>standard</MenuItem>
          <MenuItem value={"simple"}>simple</MenuItem>

          <MenuItem value={"scroll"}>scroll (deprecated)</MenuItem>
          <MenuItem value={"scrollMaxHeight"}>
            scrollMaxHeight (deprecated)
          </MenuItem>
          <MenuItem value={"stacked"}>stacked (deprecated)</MenuItem>
        </Select>
      </FormControl>
      <FormControl>
        <InputLabel id="demo-simple-select-label">Table Body Height</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={tableBodyHeight}
          style={{ width: "200px", marginBottom: "10px", marginRight: 10 }}
          onChange={(e) => setTableBodyHeight(e.target.value)}
        >
          <MenuItem value={""}>[blank]</MenuItem>
          <MenuItem value={"400px"}>400px</MenuItem>
          <MenuItem value={"800px"}>800px</MenuItem>
          <MenuItem value={"100%"}>100%</MenuItem>
        </Select>
      </FormControl>
      <MUIDataTable
        title={"ACME Employee list"}
        data={data}
        columns={columns}
        options={options}
      />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
