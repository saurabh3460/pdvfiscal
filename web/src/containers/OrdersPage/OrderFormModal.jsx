import { Alert, Button, Col, DatePicker, Form, Input, message, Row, Select, Upload, Card } from "antd";
import React, { useEffect, useState } from "react";
import { useClientOptions, useOrder } from "src/hooks";
import currencyFormatter from "src/helpers/currencyFormatterPrefix";
import { useTranslation } from "react-i18next";
import NumberFormat from "react-number-format";

import moment from "moment";

import FormModal from "src/components/FormModal";
import ClientFormModal from "../ClientsPage/ClientFormModal";
import { InputNumberFmtd } from "src/components";
import { staticFormOptions } from "src/helpers/options";
import { braillePatternBlank, computeOrderTotal } from "src/helpers";
import { ProductSelect } from "src/components";
import SelectedProducts from "src/components/SelectedProducts";
import "./OrderFormModal.scss";
import { autocompleteClasses } from "@material-ui/core";

//import Editor from "./Editor";

const paymentMethodOptions = staticFormOptions.paymentOptions.map(({ value, text }) => ({ label: text, value }));

const imageFromEvent = ({ file }) => {
  if (file.status === "removed") {
    return [];
  }
  if (file?.response?.message) {
    file.uid = file?.response?.message;
    file.url = `/uploads/${file?.response?.message}`;
  }
  return [file];
};

const ruleRequired = { required: true };
const ruleJustRequired = [ruleRequired];

const validations = {
  discount: [ruleRequired, { max: 40, min: 0, type: "number" }],
};

const defaultValue = {
  products: [],
  discount: 0,
};

function OrderFormModal({ onClose, afterPlace, initialValue, isQuotation = false, okText }) {
  const { t } = useTranslation(["translation"]);

  const [shouldShowClientAddModal, setShouldShowClientAddModal] = useState(false);
  const { save, status: saveStatus } = useOrder();
  const { options: clientOptions, status: clientOptionsStatus, refresh: refreshClientOpts } = useClientOptions();

  const [form] = Form.useForm();

  const handleFinish = (payload) => {
    const productItems = [];
    const selectedProducts = form.getFieldValue("products");

    for (let id in selectedProducts) {
      const product = selectedProducts[id];
      if (!product.quantity) continue;
      productItems.push({
        productId: product.__id,
        amount: product.quantity,
        title: product.title,
        price: product.price,
        cost: product.cost,
        comment: product.comment,
        measurementValue: product.measurementValue,
      });
    }

    save(initialValue?._id, {
      ...initialValue,
      ...payload,
      isQuotation: isQuotation,
      estConclusionDate: payload.estConclusionDate && payload.estConclusionDate.unix() * 1000,
      items: productItems,
    });
  };

  const handleProductAdd = (product) => {
    const selectedProducts = form.getFieldValue("products");

    const selectedProduct = selectedProducts.findIndex((p) => p._id === product._id);
    const selectedQuantity = selectedProduct?.quantity || 0;
    if (product.isService || isQuotation || selectedQuantity !== product.totalUnits) {
      if (selectedProduct === -1) {
        const t = {
          _id: product._id,
          __id: product._id,
          title: product.title,
          price: product.price,
          cost: product.cost,
          quantity: 1,
          images: product.images,
          chargeDuration: product.chargeDuration,
          measurementType: product.measurementType,
          measurementValue: product.measurementValue,
        };
        form.setFieldsValue({ products: [t, ...selectedProducts] });
      } else {
        selectedProducts[selectedProduct].quantity += 1;
        form.setFieldsValue({ products: selectedProducts });
      }
    }
  };

  const handleProductAddAsAnother = (product) => {
    const selectedProducts = form.getFieldValue("products");
    const selectedQuantity = selectedProducts[product._id]?.quantity || 0;
    if (product.isService || isQuotation || selectedQuantity !== product.totalUnits) {
      const t = {
        _id: Symbol(product._id),
        __id: product._id,
        title: product.title,
        price: product.price,
        cost: product.cost,
        quantity: 1,
        images: product.images,
        chargeDuration: product.chargeDuration,
        measurementType: product.measurementType,
        measurementValue: product.measurementValue,
      };

      form.setFieldsValue({
        products: [t, ...selectedProducts],
      });
    }
  };

  const handleQuantityChange = (productId, quantity, measurementValue) => {
    const selectedProducts = form.getFieldValue("products");
    const selectedProduct = selectedProducts.find((p) => p._id === productId);
    selectedProduct.quantity = quantity;
    selectedProduct.measurementValue = measurementValue;
    form.setFieldsValue({
      products: null,
    });
    form.setFieldsValue({
      products: selectedProducts,
    });
  };

  const handleCommentChange = (productId, comment) => {
    const selectedProducts = form.getFieldValue("products");
    const selectedProduct = selectedProducts.find((p) => p._id === productId);
    selectedProduct.comment = comment;

    // uncomment of setFieldsValue has no impact
    // form.setFieldsValue({
    //   products: null,
    // });
    form.setFieldsValue({
      products: selectedProducts,
    });
  };

  const handleDelete = (productId) => {
    const selectedProducts = form.getFieldValue("products");
    const i = selectedProducts.findIndex((p) => p._id === productId);

    form.setFieldsValue({
      products: null,
    });
    form.setFieldsValue({
      products: [...selectedProducts.slice(0, i), ...selectedProducts.slice(i + 1)],
    });
  };

  const handleAddClientClick = () => {
    setShouldShowClientAddModal(true);
  };

  const closeClientFormModal = () => setShouldShowClientAddModal(false);

  const handleAddClient = (_id) => {
    setShouldShowClientAddModal(false);
    refreshClientOpts();
    form.setFieldsValue({ clientId: _id });
  };

  useEffect(() => {
    if (saveStatus.isSuccess) {
      message.success(t("pedido adicionado com sucesso"));
      afterPlace();
    }
    if (saveStatus.isError) {
      message.error(saveStatus.message);
    }
  }, [saveStatus, afterPlace]);

  let temp = new Set();
  const denormInitValue = initialValue
    ? {
        products: initialValue.items.map(({ productId, amount, ...rest }) => {
          const _id = temp.has(productId) ? Symbol(productId) : productId;
          temp.add(productId);
          return {
            _id: _id,
            __id: productId,
            quantity: amount,
            ...rest,
          };
        }),
        clientId: (initialValue.client || {})._id,
        comment: initialValue.comment,
        discount: initialValue.discount,
        // isQuotation: initialValue.status === 4 ,
        estConclusionDate: initialValue.estConclusionDate ? moment(initialValue.estConclusionDate) : undefined,
      }
    : defaultValue;

  return (

    <FormModal
      className="order-place-form-modal"
      formID="order-place-form"
      okText={okText}
      onClose={onClose}
      submitButtonProps={{ loading: saveStatus.isLoading }}
      width="100%"
      style={{ top: 16 }}
      organizationId={denormInitValue?.organizationId}
    >    
      <Form
        id="order-place-form"
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={denormInitValue}
        preserve={false}
        onValuesChange={console.log}
      >
        
<Form.Item wrapperCol={{ span: 24 }} shouldUpdate>
          {({ getFieldValue: f }) => (
            <div style={{ textAlign: "right", fontSize: "1.2em", marginBottom: 15, color: "green", fontWeight: 700 }}>
              {t("Total")}: {currencyFormatter.format(computeOrderTotal(f("products"), f("discount")))}
            </div>
          )}
        </Form.Item>
       <Card style={{ minHeight: 355 }}>
            <ProductSelect onAdd={handleProductAdd} onAddAsNew={handleProductAddAsAnother} enableOutOfStock={isQuotation} />
          </Card>
          <Card style={{ minHeight: "25%"}}>
          <Col>
            <Form.Item className="products-form-item" rules={ruleJustRequired} shouldUpdate>
              {({ getFieldValue }) => (
                <SelectedProducts
                  products={getFieldValue("products")}
                  onQuantityChange={handleQuantityChange}
                  onCommentChange={handleCommentChange}
                  onDelete={handleDelete}
                />
              )}
            </Form.Item>
          </Col>
          </Card>

          <Card style={{ minHeight: "25%"}}>
          <Col>
            <Form.Item name="clientId" label={t("Client")} rules={ruleJustRequired}>
              <Select
                options={clientOptions}
                loading={clientOptionsStatus.isLoading}
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Button onClick={handleAddClientClick} block>
                      + Add Client
                    </Button>
                  </div>
                )}
                filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                showSearch
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              label={t("% Discount")}
              name="discount"
              trigger="onValueChange"
              getValueFromEvent={(vs) => vs.floatValue}
              rules={validations.discount}
            >
              <NumberFormat
                customInput={Input}
                thousandSeparator="."
                decimalSeparator=","
                //disabled={initialValue?._id && !isQuotation}
              />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item label={t("Conclude By")} name="estConclusionDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          {!isQuotation && !initialValue?._id && (
            <Form.Item dependencies={["isQuotation"]} noStyle>
              {({ getFieldValue }) => (
                <>
                  <Col>
                    <Form.Item name="paid" label={t("Paid Amount")}>
                      <InputNumberFmtd disabled={!!getFieldValue("isQuotation")} />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item name="paymentMethod" label={t("Payment Method")}>
                      <Select options={paymentMethodOptions} disabled={!!getFieldValue("isQuotation")} />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item
                      label={braillePatternBlank}
                      name="proofOfPayment"
                      getValueFromEvent={imageFromEvent}
                      valuePropName="fileList"
                      shouldUpdate
                    >
                      <Upload
                        action="/api/assets/upload?entity=transaction"
                        accept="image/*, .pdf"
                        headers={{
                          Authorization: `Bearer ${localStorage.getItem("token")}`,
                        }}
                      >
                        <Button disabled={!!getFieldValue("isQuotation")}>{t("Upload Proof")}</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                </>
              )}
            </Form.Item>
          )}
        </Card>
        <Card title={t("Comment")} bordered={false} style={{ width: "100%" }}>
        <Form.Item name="comment">
          <Input.TextArea placeholder={t("Comment")} style={{ width: "100%" }} rows={5}  /> 
          {/* <Editor />*/}
        </Form.Item>
        </Card>
      </Form>
      {saveStatus.isError && <Alert message={saveStatus.message} type="error" />}
      {shouldShowClientAddModal && (
        <ClientFormModal afterSave={handleAddClient} onClose={closeClientFormModal} okText={`${t("Add")} ${t("Client")}`} />
      )}
    </FormModal>
  );
}

export default OrderFormModal;
