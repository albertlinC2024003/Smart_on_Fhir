import ErrorPage from './ErrorPage';
import LoginView from './FrontGate';
import Test from './Test';
import Normal from './Normal';
import Private from './Private';
import FhirGetter from "./FhirGetter";
import CQLGetter from "./CQLGetter";
import SingleResourceViewer from "./fhir/view/SingleResourceViewer";
import BonFhir from "./fhir/view/BonFhir.tsx";
import CodeHandler from '../utils/module/CodeHandler.tsx';
import Lobby from './Lobby';
import EHREntry from './EHREntry';
import EHRLaunch from './Launch';

export default {
    ErrorPage,
    LoginView,
    Lobby,
    Test,
    Normal,
    Private,
    FhirGetter,
    CQLGetter,
    BonFhir,
    SingleResourceViewer,
    CodeHandler,
    EHREntry,
    EHRLaunch,
}
