import { useAPI, useFormatters } from "shared/hooks";
import { Table, Radio } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";
//import MUIDataTable from "mui-datatables";

const orderProcesses = [
  "None",
  "New",
  "Preparation",
  "Production",
  "Quality",
  "Finishing",
  "Completed",
  "Delivered | Returned",
  "Concluded",
  "Canceled",
];

const paymentStatuses = [
  "None", "Open", "Partial", "Closed", "Quotation"
];

function subtotal(items) {
  return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
}

function OrderProductList({ products }) {
  const { t } = useTranslation("translation");
  const { cf, nf } = useFormatters();

  const withQuantityPrefix = (v) => `x ${nf(v)}`;

  return (
    <>
    <Table
      onChange={onChange}
      dataSource={products}
      size="small"
      showHeader={false}
      pagination={false}
      bordered
      rowKey="title"
    >
      <Table.Column dataIndex="title" title={t("Title")}></Table.Column>
      <Table.Column
        dataIndex="quantity"
        title={t("Quantity")}
        render={withQuantityPrefix}
      ></Table.Column>
      <Table.Column
        dataIndex="price"
        title={t("Price")}
        render={cf}
      ></Table.Column>
    </Table>
    </>
  );
}

function onChange(pagination, filters, sorter, extra) {
  console.log('params', pagination, filters, sorter, extra);
}
const productRenderer = (products) => <OrderProductList products={products} />;

const denormalize = (o) => ({
  ...o,
  createdAt: new Date(o.createdAt),
});

const useOrders = () => {
  const { data = [], status } = useAPI("/api/v1/orders");
  return { data: data.map(denormalize), status };
};

const expandable = { expandedRowRender: record => <p>{record.total}</p> };
const pagination = { position: 'bottom' };

function OrderList() {
  const { t } = useTranslation("translation");
  const { cf, df } = useFormatters();
  const { data, status } = useOrders();

  const statusRenderer = (status) => t(orderProcesses[status]);
  const paymentStatusRenderer = (status) => t(paymentStatuses[status]);
  //const sumCalc = cf(totalCost - totalPaid);
  return (
    <>
    
    <Table 
      expandable
      bordered= {true}
      loading= {false}
      pagination
      scroll= {undefined}
      hasData= {true}
      tableLayout= {undefined}
      top= 'none'
      bottom= 'bottomRight'
      onChange={onChange}  
      dataSource={data} 
      //pagination={true} 
      bordered rowKey="_id">
      <Table.Column
        dataIndex="createdAt"
        title={t("Date")}
        render={df}
        sorter= {(a, b) => a.createdAt - b.createdAt}
      ></Table.Column>
      <Table.Column
        dataIndex="items"
        title={t("Products")}
        render={productRenderer}
        sorter= {(a, b) => a.items - b.items}
      ></Table.Column>
      <Table.Column
        dataIndex="status"
        title={t("Status")}
        render={statusRenderer}
        sorter= {(a, b) => a.status - b.status}
        filterMode= "tree"
        filterSearch= {true}
        onFilter= {(value, record) => record.status.indexOf(value) === 0}
        width= "30%"
      ></Table.Column>
      <Table.Column
        dataIndex="paymentStatus"
        title={t("Payment Status")}
        render={paymentStatusRenderer}
        sorter= {(a, b) => a.paymentStatus - b.paymentStatus}
      ></Table.Column>
      <Table.Column
        expandable
        dataIndex="total"
        title={t("Total Amount")}
        render={cf}
        sorter= {(a, b) => a.total - b.total}
      ></Table.Column>
      <Table.Column
        dataIndex="total"
        title={t("Total Paid")}
        render={cf}
      ></Table.Column>
      <Table.Column
        dataIndex= "total"
        title={t("Total Remained")}
        render={cf}
      ></Table.Column>
    </Table>
    </>
  );
}

export default OrderList;
