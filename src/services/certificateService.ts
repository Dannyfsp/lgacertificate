import Certificate from "../models/certificationModal";
import { generateCertificateRef } from "../utils/hash";

const CertificateService = {
    certificateReference: async (): Promise<string> => {
        let ref = "";
        let exists = true;

        while (exists) {
            ref = generateCertificateRef(9);
            const existing = await Certificate.exists({ certificateRef: ref });
            exists = !!existing;
        }

        return ref;
    }

};

export default CertificateService;