library ChronicAdherenceLibrary version '1.1.2'
using FHIR version '4.0.1'
include FHIRHelpers version '4.0.1'

parameter "TargetDiagnosisCode" String default 'E11'
parameter "ThresholdDays" Integer default 7

context Patient

define IP: exists([Condition: code in "TargetDiagnosisCode"])
define DEN: IP
define LatestMed: Last([MedicationRequest] M where M.status.value = 'active' and M.dispenseRequest.expectedSupplyDuration.value.value > 21 sort by authoredOn)
define NUM: DEN and LatestMed is not null and (days between LatestMed.authoredOn.value and Now()) > (Coalesce(LatestMed.dispenseRequest.expectedSupplyDuration.value.value, 0) + "ThresholdDays")