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
// import EHREntry from './EHREntry';
import EHREntry from './SearchByCondition';
import EHRDoc from './EHRDoc';//大廳

import ChronicDisease from './ehr/ChronicDiseaseDashBoard.tsx';
import MedicationRisk from './ehr/MedicationRiskDashBoard.tsx';
import ChronicTracker from './ehr/ChronicTracker.tsx';
import MedicationStatistic from './ehr/MedicationStatistic.tsx';
// import EHRLaunch from './Launch';

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
    // EHRLaunch,
    EHRDoc,
    ChronicDisease,
    MedicationRisk,
    ChronicTracker,
    MedicationStatistic,
}
