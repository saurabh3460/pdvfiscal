import React, { useState } from "react";
import { Button, Form, Icon, Label, Modal } from "semantic-ui-react";
import { staticFormOptions } from "../../../helpers/options";
import { addOrderPayment, updateOrderPayment, uploadProofPayment } from "../../../services/orderService";
import currencyFormatterPrefix from "../../../helpers/currencyFormatterPrefix";
import { useNewCheques } from "src/hooks";
import { useTranslation } from "react-i18next";
import { cfw, roundw } from "src/helpers";

const AddOrderPaymentModal = ({ order, loadOrders, addToast, onClose, afterSave, initialValues }) => {
  const { t } = useTranslation("translation");
  const [paymentType, setPaymentType] = useState(initialValues?.method);
  const [paymentAmount, setPaymentAmount] = useState(initialValues?.amount);
  const [proofPaymentUrl, setProofPaymentUrl] = useState(initialValues?.fileLink);

  const [isFileUploading, setIsFileUploading] = useState(false);
  const [isPaymentAmountValid, setIsPaymentAmountValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [chequeId, setChequeId] = useState(initialValues?.chequeId);

  const [cheques] = useNewCheques(order?.organizationId);

  const isAmountValid = (amount, total) => {
    return amount > 0 && amount <= total;
  };

 // const noPaymentSince30days = (order) => {
 //   const lastTransactionOn = (order.transactions || []).sort((a, b) => b.createdAt - a.createdAt)[0]?.createdAt;
 //   const lastPaymentOn = lastTransactionOn || order.createdAt;
 //   return [1, 2].includes(order.status) && Date.now() - lastPaymentOn * 1000 > _30Days;
//  };

  const letfToPay = cfw(order.totalCost - order.totalPaid);
  const juros = 0.03;
  const latefees = cfw(order.totalCost*juros - order.totalPaid*juros);
  
  const chequeOptions = cheques.map(({ no, destinationBank, amount, _id }) => ({
    text: `${no} - ${destinationBank} - (${currencyFormatterPrefix.format(amount)})`,
    value: _id,
  }));

  if (initialValues?.cheque) {
    chequeOptions.push({
      text: `${initialValues.cheque.no} (${currencyFormatterPrefix.format(initialValues.cheque.amount)})`,
      value: initialValues.cheque._id,
    });
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    setIsFileUploading(true);
    uploadProofPayment(order._id, file)
      .then((res) => {
        setProofPaymentUrl(res.message);
      })
      .catch((err) => {
        addToast(t("failed to upload proof of payment"), { appearance: "error" });
      })
      .finally(() => {
        setIsFileUploading(false);
      });
  };

  const submitOrderPayment = async () => {
    const amount = +paymentAmount;
    if (!isPaymentAmountValid || paymentType <= 0 || amount === 0) {
      return;
    }
    const payload = {
      method: paymentType,
      amount: +paymentAmount,
      fileLink: proofPaymentUrl,
      chequeId: chequeId,
      orderId: order._id,
    };
    setIsLoading(true);
    await (initialValues?._id
      ? updateOrderPayment(order._id, initialValues._id, payload)
      : addOrderPayment(order._id, payload, order.organizationId)
    )
      .then((resp) => {
        if (initialValues?._id) {
          addToast(t("transaction") + " " + t("changed successfully"), {
            appearance: "success",
          });
        } else {
          addToast(t("Payment added"), { appearance: "success" });
        }
        afterSave();
      })
      .catch((err) => {
        setError("err.error");
      });

    setIsLoading(false);
    loadOrders();
  };

  return (
    <Modal open onClose={onClose} style={{ minWidth: "auto" }} closeIcon>
      <Modal.Header>{t("Add payment")}</Modal.Header>
      <Modal.Content>
        <span>
          <strong>{t("Total Cost")}:</strong> <b>{cfw(order.totalCost)}</b>
        </span>
        <br />
        <span>
          <strong>{t("Total Paid")}:</strong> {cfw(order.totalPaid)}
        </span>
        <br />
        <span>
          <strong>{t("Left to pay")}:</strong> {letfToPay}
        </span>
        <br />
        <span>
          <strong>{t("Rates")}:</strong> {latefees}
        </span>
        <br />
        <br />

        <Form firstName="createAdminForm" size="large" onSubmit={submitOrderPayment}>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              placeholder={letfToPay}
              label={t("Amount") + " " +  letfToPay}
              type="number"
              step={0.01}
              defaultValue={letfToPay}
              value={paymentAmount}
              error={
                !isPaymentAmountValid && {
                  content: `${t("Enter amount between 0,1 and")} ${
                    initialValues?._id ? cfw(order.totalCost) :letfToPay
                  }`,
                  pointing: "above",
                }
              }
              // error={!isPaymentAmountValid}
              message={"sdvf"}
              onChange={(ev) => setPaymentAmount(ev.target.value)}
              onBlur={() =>
                setIsPaymentAmountValid(
                  isAmountValid(
                    paymentAmount,
                    initialValues?._id ? roundw(order.totalCost) : roundw(order.totalCost - order.totalPaid)
                  )
                )
              }
            />
            <Form.Input
              fluid
              placeholder={latefees}
              label={t("Rates") + " " +  latefees}
              type="number"
              step={0.01}
              defaultValue={latefees}
              value={latefees}
              
            />

            <Form.Select
              fluid
              label={t("Payment Type")}
              options={staticFormOptions.paymentOptions}
              defaultValue={paymentType}
              placeholder={t("Payment Type")}
              onChange={(e, { value }) => setPaymentType(value)}
              required
            />
            <Form.Select
              fluid
              label={t("Cheque")}
              options={chequeOptions}
              onChange={(e, { value }) => setChequeId(value)}
              required={paymentType === 4}
              disabled={paymentType !== 4}
              defaultValue={chequeId}
              search
            ></Form.Select>
            {proofPaymentUrl ? (
              <div className="field" style={{ alignSelf: "center", paddingTop: 16 }}>
                <a target="_blank" href={`/assets/${proofPaymentUrl}`} style={{ marginRight: 16 }}>
                  {proofPaymentUrl}
                </a>
                <Button icon="delete" onClick={() => setProofPaymentUrl(undefined)}></Button>
              </div>
            ) : (
              <Form.Input
                style={{ width: "200px" }}
                name="file"
                label={t("Proof of payment")}
                type="file"
                accept=".jpg, .jpeg, .pdf, .png"
                onChange={handleFileSelect}
              />
            )}
          </Form.Group>
          <Form.Group>{error && <Label color="red">{error}</Label>}</Form.Group>

          <div style={{ textAlign: "right" }}>
            <Button type="button" onClick={onClose}>
              {t("Cancel")}
            </Button>
            <Button type="submit" loading={isLoading} primary disabled={isFileUploading}>
              {t("Submit")}
            </Button>
          </div>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default AddOrderPaymentModal;
