import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, PDFViewer, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    textDecoration: 'underline',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  serviceItem: {
    marginLeft: 10,
    marginBottom: 3,
  },
  signatureContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  signatureImage: {
    width: 200,
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
});

// Composant pour le document PDF
const PrestationPDF = ({ invoice }) => {
  // Formatage de la date
  const formattedDate = invoice.date ? 
    format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr }) : 
    'Date non spécifiée';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>PRESTATION</Text>
        </View>

        {/* Infos principales */}
        <View>
          <Text style={styles.text}>
            <Text style={styles.bold}>Numéro de prestation: </Text>
            {invoice.numberInvoice || 'Non spécifié'}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Date: </Text>
            {formattedDate}
          </Text>
        </View>

        {/* Client */}
        <View>
          <Text style={styles.sectionTitle}>Client:</Text>
          <Text style={styles.text}>
            {invoice.customer ? invoice.customer.name : `ID Client: ${invoice.customerId}`}
          </Text>
        </View>

        {/* Services */}
        {invoice.associatedServices && invoice.associatedServices.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Services fournis:</Text>
            {invoice.associatedServices.map((service, index) => (
              <Text key={index} style={[styles.text, styles.serviceItem]}>
                • {service.name}
              </Text>
            ))}
          </View>
        )}

        {/* Signature */}
        {invoice.tagline && (
          <View style={styles.signatureContainer}>
            <Text style={styles.sectionTitle}>Signature:</Text>
            <Image 
              style={styles.signatureImage} 
              src={invoice.tagline} 
            />
          </View>
        )}

        {/* Pied de page */}
        <Text style={styles.footer}>
          Ce document est généré automatiquement.
        </Text>
      </Page>
    </Document>
  );
};

export const PrestationPDFViewer = ({ invoice }) => (
  <PDFViewer width="100%" height="600px">
    <PrestationPDF invoice={invoice} />
  </PDFViewer>
);

export const PrestationPDFDownload = ({ invoice }) => (
  <PDFDownloadLink 
    document={<PrestationPDF invoice={invoice} />} 
    fileName={`prestation_${invoice.numberInvoice || 'sans_numero'}.pdf`}
    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
  >
    {({ blob, url, loading, error }) => 
      loading ? 'Génération du PDF...' : 'Télécharger le PDF'
    }
  </PDFDownloadLink>
);

export const generatePDFBlob = async (invoice) => {
  return new Promise((resolve, reject) => {
    const MyDoc = () => <PrestationPDF invoice={invoice} />;
    
    const renderToBlob = ({ blob }) => {
      resolve(blob);
    };
    
    <BlobProvider document={<MyDoc />} onComplete={renderToBlob} onError={reject} />;
  });
};

export default PrestationPDF;