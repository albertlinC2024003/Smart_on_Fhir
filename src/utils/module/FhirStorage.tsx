import {createContext, useContext, useState} from 'react';
import type { FhirStorage } from "../../dto/componentObj.ts";
import { FhirResource } from "../../enum/component.ts";

const storage = createContext<FhirStorage>({
    fhirJson: '',
    fullUrl: '',
    fhirResource: undefined,
    setFhirJson: () => {},
    setFullUrl: () => {},
    setFhirResource: () => {},
});

export const useFhirStorage = () => {
    const context = useContext(storage);
    const [fhirJson, setFhirJson] = useState('');
    const [fullUrl, setFullUrl] = useState('');
    const [fhirResource, setFhirResource] = useState<FhirResource>();
    context.fhirJson = fhirJson;
    context.fullUrl = fullUrl;
    context.fhirResource = fhirResource;
    context.setFhirJson = setFhirJson;
    context.setFullUrl = setFullUrl;
    context.setFhirResource = setFhirResource;

    return { fhirJson, setFhirJson, fullUrl, setFullUrl, fhirResource, setFhirResource };
};

// export const useFhirStorage = (): FhirStorage => {
//     const [fhirJson, setFhirJson] = useState('');
//     const [fullUrl, setFullUrl] = useState('');
//     const [fhirResource, setFhirResource] = useState<FhirResource>();
//
//     return { fhirJson, setFhirJson, fullUrl, setFullUrl, fhirResource, setFhirResource };
// };