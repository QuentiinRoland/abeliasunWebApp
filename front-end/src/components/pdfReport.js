import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, PDFViewer, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#2c5282',
    paddingBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
  },
  logo: {
    width: 100,
    height: 'auto',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c5282',
  },
  invoiceNumber: {
    fontSize: 14,
    marginTop: 5,
    color: '#4a5568',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#ebf4ff', // Bleu très léger
    padding: 5,
    color: '#2c5282',
  },
  clientInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  clientInfo: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
  },
  dateInfo: {
    width: '48%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    backgroundColor: '#f7fafc',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: '#2d3748',
  },
  bold: {
    fontWeight: 'bold',
  },
  serviceItem: {
    marginLeft: 10,
    marginBottom: 6,
    flexDirection: 'row',
  },
  bullet: {
    width: 15,
    textAlign: 'center',
  },
  serviceName: {
    flex: 1,
  },
  serviceTable: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f7fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
  },
  tableCell: {
    fontSize: 12,
    color: '#2d3748',
  },
  col1: { width: '10%' },
  col2: { width: '50%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  employeesSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  employee: {
    marginBottom: 5,
  },
  picturesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  pictureFrame: {
    width: '48%',
    marginBottom: 10,
    borderWidth: 1, 
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    padding: 5,
  },
  picture: {
    width: '100%',
    height: 120,
    objectFit: 'cover',
  },
  signatureContainer: {
    marginTop: 30,
    alignItems: 'flex-end',
  },
  signatureImage: {
    width: 150,
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#718096',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
});

const PrestationPDF = ({ invoice, companyLogo }) => {
  const formattedDate = invoice.date ? 
    format(new Date(invoice.date), 'dd MMMM yyyy', { locale: fr }) : 
    'Date non spécifiée';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            {companyLogo ? (
              <Image style={styles.logo} src={companyLogo} />
            ) : (
              <Text style={styles.bold}>LOGO</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>PRESTATION</Text>
            <Text style={styles.invoiceNumber}>N° {invoice.numberInvoice || '[Non spécifié]'}</Text>
          </View>
        </View>

        <View style={styles.clientInfoContainer}>
          <View style={styles.clientInfo}>
            <Text style={[styles.text, styles.bold]}>CLIENT:</Text>
            <Text style={styles.text}>
              {invoice.customer ? invoice.customer.name : `ID Client: ${invoice.customerId}`}
            </Text>
            {invoice.customer && invoice.customer.address && (
              <Text style={styles.text}>{invoice.customer.address}</Text>
            )}
            {invoice.customer && invoice.customer.email && (
              <Text style={styles.text}>Email: {invoice.customer.email}</Text>
            )}
            {invoice.customer && invoice.customer.phone && (
              <Text style={styles.text}>Tél: {invoice.customer.phone}</Text>
            )}
          </View>
          <View style={styles.dateInfo}>
            <Text style={[styles.text, styles.bold]}>DÉTAILS:</Text>
            <Text style={styles.text}>Date: {formattedDate}</Text>
            <Text style={styles.text}>Prestation N°: {invoice.numberInvoice || '[Non spécifié]'}</Text>
          </View>
        </View>

        {invoice.associatedServices && invoice.associatedServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services fournis</Text>
            <View style={styles.serviceTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.col1]}>N°</Text>
                <Text style={[styles.tableHeaderCell, styles.col2]}>Service</Text>
                <Text style={[styles.tableHeaderCell, styles.col3]}>Catégorie</Text>
                <Text style={[styles.tableHeaderCell, styles.col4]}>Référence</Text>
              </View>
              {invoice.associatedServices.map((service, index) => (
                <View style={styles.tableRow} key={index}>
                  <Text style={[styles.tableCell, styles.col1]}>{index + 1}</Text>
                  <Text style={[styles.tableCell, styles.col2]}>{service.name}</Text>
                  <Text style={[styles.tableCell, styles.col3]}>{service.category || '-'}</Text>
                  <Text style={[styles.tableCell, styles.col4]}>{service.referenceId || '-'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {invoice.selectedSubServices && invoice.selectedSubServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détail des prestations</Text>
            {invoice.selectedSubServices.map((subService, index) => (
              <View style={styles.serviceItem} key={index}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.text, styles.serviceName]}>
                  {subService.name} {subService.description ? `- ${subService.description}` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {invoice.employees && invoice.employees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Intervenants</Text>
            <View style={styles.employeesSection}>
              {invoice.employees.map((employee, index) => (
                <Text style={[styles.text, styles.employee]} key={index}>
                  • {employee.firstName} {employee.lastName} - {employee.position || 'Technicien'}
                </Text>
              ))}
            </View>
          </View>
        )}

        {invoice.pictures && invoice.pictures.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos de la prestation</Text>
            <View style={styles.picturesContainer}>
              {invoice.pictures.map((pic, index) => (
                <View style={styles.pictureFrame} key={index}>
                  <Image style={styles.picture} src={pic} />
                </View>
              ))}
            </View>
          </View>
        )}

        {invoice.tagline && (
          <View style={styles.signatureContainer}>
            <Text style={[styles.text, styles.bold]}>Signature:</Text>
            <Image style={styles.signatureImage} src={invoice.tagline} />
          </View>
        )}

        <Text style={styles.footer}>
          Document généré automatiquement le {format(new Date(), 'dd/MM/yyyy', { locale: fr })}
        </Text>
      </Page>
    </Document>
  );
};

export const PrestationPDFViewer = ({ invoice, companyLogo }) => (
  <PDFViewer width="100%" height="600px">
    <PrestationPDF invoice={invoice} companyLogo={companyLogo} />
  </PDFViewer>
);

export const PrestationPDFDownload = ({ invoice, companyLogo }) => (
  <PDFDownloadLink 
    document={<PrestationPDF invoice={invoice} companyLogo={companyLogo} />} 
    fileName={`prestation_${invoice.numberInvoice || 'sans_numero'}.pdf`}
    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
  >
    {({ blob, url, loading, error }) => 
      loading ? 'Génération du PDF...' : 'Télécharger le PDF'
    }
  </PDFDownloadLink>
);

export const generatePDFBlob = async (invoice, companyLogo) => {
  return new Promise((resolve, reject) => {
    const MyDoc = () => <PrestationPDF invoice={invoice} companyLogo={companyLogo} />;
    
    <BlobProvider document={<MyDoc />} onComplete={({ blob }) => resolve(blob)} onError={reject} />;
  });
};

export default PrestationPDF;