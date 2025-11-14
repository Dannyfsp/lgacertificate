// import PDFDocument from 'pdfkit';
// import axios from 'axios';
// import { IApplication } from '../models/applicationModel';
// import { IUser } from '../models/userModel';


// interface CertificateImages {
//   userPassport: string;
//   secretarySignature: string;
//   chairmanSignature: string;
// }

// export const generateCertificatePDF = async (
//   application: IApplication & { user: IUser }, 
//   images: CertificateImages
// ): Promise<Buffer> => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const doc = new PDFDocument({
//         size: 'A4',
//         margins: { top: 50, bottom: 50, left: 50, right: 50 }
//       });

//       const buffers: Buffer[] = [];
      
//       doc.on('data', (chunk: Buffer) => buffers.push(chunk));
//       doc.on('end', () => resolve(Buffer.concat(buffers)));
//       doc.on('error', reject);

//       addNigerianBorder(doc);
//       addHeader(doc, application.lga);
//       await addPassportPhoto(doc, images.userPassport);
//       addCertificateContent(doc, application);
//       await addSignatures(doc, images);

//       doc.end();
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

// const addNigerianBorder = (doc: PDFKit.PDFDocument) => {
//   doc.rect(30, 30, 535, 755)
//      .lineWidth(3)
//      .strokeColor('#008751')
//      .stroke();
  
//   doc.rect(40, 40, 515, 735)
//      .lineWidth(1)
//      .strokeColor('#000000')
//      .stroke();
// };

// const addHeader = (doc: PDFKit.PDFDocument, lga: string) => {
//   doc.rect(50, 50, 495, 80)
//      .fill('#008751');

//   doc.rect(50, 130, 495, 20)
//      .fill('#FFFFFF');

//   doc.rect(50, 150, 495, 20)
//      .fill('#008751');

//   doc.fontSize(20)
//      .font('Helvetica-Bold')
//      .fillColor('#FFFFFF')
//      .text('CERTIFICATE OF ORIGIN', 50, 70, { align: 'center', width: 495 });

//   doc.fontSize(16)
//      .text(`${lga.toUpperCase()} LOCAL GOVERNMENT AREA`, 50, 100, { align: 'center', width: 495 })
//      .text('NIGERIA', 50, 120, { align: 'center', width: 495 });
// };

// const addPassportPhoto = async (doc: PDFKit.PDFDocument, photoUrl: string) => {
//   try {
//     const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
//     const imageBuffer = Buffer.from(response.data, 'binary');
    
//     doc.rect(400, 200, 120, 150)
//        .strokeColor('#000000')
//        .lineWidth(1)
//        .stroke();

//     doc.image(imageBuffer, 405, 205, { width: 110, height: 140 });
    
//     doc.fontSize(10)
//        .fillColor('#000000')
//        .text('PASSPORT PHOTOGRAPH', 400, 360, { width: 120, align: 'center' });
//   } catch (error) {
//     doc.rect(400, 200, 120, 150)
//        .fill('#CCCCCC')
//        .strokeColor('#000000')
//        .stroke();
    
//     doc.fontSize(8)
//        .fillColor('#666666')
//        .text('Photo Unavailable', 400, 275, { width: 120, align: 'center' });
//   }
// };

// const addCertificateContent = (doc: PDFKit.PDFDocument, application: IApplication & { user: IUser }) => {
//   const startY = 200;
  
//   const certificateRef = `LGA/${application.lga.toUpperCase()}/${application.nin.slice(-6)}`;
  
//   doc.fontSize(12)
//      .fillColor('#000000')
//      .font('Helvetica-Bold')
//      .text(`Certificate Reference: ${certificateRef}`, 50, startY)
//      .font('Helvetica');

//   const fullName = `${application.user.firstName} ${application.user.middleName} ${application.user.lastName}`.toUpperCase();
  
//   const content = [
//     `THIS IS TO CERTIFY THAT ${fullName},`,
//     `son/daughter of ${application.fatherNames.toUpperCase()} and ${application.motherNames.toUpperCase()},`,
//     `holder of National Identification Number: ${application.nin},`,
//     `is an indigene of ${application.nativeTown.toUpperCase()} in ${application.nativePoliticalWard.toUpperCase()},`,
//     `${application.lga.toUpperCase()} Local Government Area.`,
//     ``,
//     `The applicant hails from ${application.village.toUpperCase()} village and`,
//     `is known to the community under the leadership of ${application.communityHead.toUpperCase()}.`,
//     ``,
//     `This certificate is issued based on the verification conducted and`,
//     `serves as confirmation of the bearer's local government of origin.`,
//     ``,
//     `Current Address: ${application.currentAddress}`
//   ];

//   content.forEach((line, index) => {
//     doc.text(line, 50, startY + 40 + (index * 18), { width: 340 });
//   });
// };

// const addSignatures = async (doc: PDFKit.PDFDocument, images: CertificateImages) => {
//   const startY = 520;

//   try {
//     const secResponse = await axios.get(images.secretarySignature, { responseType: 'arraybuffer' });
//     const secSignatureBuffer = Buffer.from(secResponse.data, 'binary');
    
//     const chairResponse = await axios.get(images.chairmanSignature, { responseType: 'arraybuffer' });
//     const chairSignatureBuffer = Buffer.from(chairResponse.data, 'binary');

//     doc.image(secSignatureBuffer, 80, startY, { width: 120, height: 50 });
//     doc.moveTo(80, startY + 60)
//        .lineTo(200, startY + 60)
//        .stroke();
    
//     doc.fontSize(10)
//        .text('Secretary', 80, startY + 65, { width: 120, align: 'center' })
//        .text(getCurrentDate(), 80, startY + 80, { width: 120, align: 'center' });

//     doc.image(chairSignatureBuffer, 320, startY, { width: 120, height: 50 });
//     doc.moveTo(320, startY + 60)
//        .lineTo(440, startY + 60)
//        .stroke();
    
//     doc.text('Chairman', 320, startY + 65, { width: 120, align: 'center' })
//        .text(getCurrentDate(), 320, startY + 80, { width: 120, align: 'center' });

//   } catch (error) {
//     doc.moveTo(80, startY + 60)
//        .lineTo(200, startY + 60)
//        .stroke();
    
//     doc.fontSize(10)
//        .text('_________________________', 80, startY + 40, { width: 120, align: 'center' })
//        .text('Secretary', 80, startY + 65, { width: 120, align: 'center' })
//        .text(getCurrentDate(), 80, startY + 80, { width: 120, align: 'center' });

//     doc.moveTo(320, startY + 60)
//        .lineTo(440, startY + 60)
//        .stroke();
    
//     doc.text('_________________________', 320, startY + 40, { width: 120, align: 'center' })
//        .text('Chairman', 320, startY + 65, { width: 120, align: 'center' })
//        .text(getCurrentDate(), 320, startY + 80, { width: 120, align: 'center' });
//   }

//   doc.rect(200, startY + 120, 200, 80)
//      .dash(5, { space: 5 })
//      .stroke()
//      .undash();

//   doc.fontSize(8)
//      .text('OFFICIAL STAMP HERE', 200, startY + 150, { width: 200, align: 'center' });
// };

// const getCurrentDate = (): string => {
//   return new Date().toLocaleDateString('en-NG', {
//     day: '2-digit',
//     month: 'long',
//     year: 'numeric'
//   });
// };