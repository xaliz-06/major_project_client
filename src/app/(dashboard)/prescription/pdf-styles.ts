// pdf-styles.ts
import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: "1 solid #e0e0e0",
    paddingBottom: 15,
  },
  headerText: {
    fontSize: 10,
    color: "#555",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
    textDecoration: "none",
    fontFamily: "Helvetica-Bold",
  },
  section: {
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottom: "1 solid #3498db",
    paddingBottom: 4,
    color: "#2c3e50",
    fontFamily: "Helvetica-Bold",
  },
  patientInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 4,
  },
  infoItem: {
    width: "48%",
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#34495e",
  },
  infoValue: {
    marginBottom: 6,
  },
  listItem: {
    marginLeft: 10,
    marginBottom: 4,
  },
  medicineItem: {
    marginBottom: 10,
  },
  medicineRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  medicineLabel: {
    width: 80,
    fontWeight: "bold",
    color: "#34495e",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTop: "1 solid #e0e0e0",
    paddingTop: 10,
  },
  signature: {
    width: 120,
    height: 40,
    marginBottom: 10,
  },
  doctorInfo: {
    textAlign: "right",
  },
  doctorName: {
    fontWeight: "bold",
    fontSize: 13,
  },
  license: {
    fontSize: 10,
    color: "#555",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 10,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#3498db",
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCellHeader: {
    fontWeight: "bold",
    fontSize: 11,
    color: "white",
  },
  tableCell: {
    fontSize: 11,
  },
  summaryText: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 4,
    borderLeft: "3 solid #3498db",
  },

  highlight: {
    backgroundColor: "#fffde7",
    padding: 2,
  },
});
