import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import BusinessHeader from '../../businessHeader';
import ConsentOverView from '../../forward-consent-form/overview/ConsentOverView';
import QuestionsList from '../../forward-consent-form/questions/QuestionsList';
import SignatureCanvas from 'react-signature-canvas';
import placeHolder from '../../../assets/forward-consent-form/treatment-placeholder.svg';
import { ReactComponent as PayFullIcon } from '../../../assets/forward-consent-form/pay_full.svg';
import { ReactComponent as PayDepositIcon } from '../../../assets/forward-consent-form/pay_deposit.svg';
import { ReactComponent as PayDayIcon } from '../../../assets/forward-consent-form/pay_day.svg';

import './forward-consent-form.scss';
import CustomRadioButton from '../../common/CustomRadioButton';
import StepButton from '../../common/StepButton';
import FileUpload from '../../common/FileUpload';
import { StripeComponent } from '../../Stripe/StripeComponent';
import OffCanvasModal from '../../modal/OffCanvasModal/OffCanvasModal';
import EditClientDetails from '../../forward-consent-form/clientDetailsOffCanvas/EditClientDetails';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import SkeletonLoader from '../../common/Skeleton/SkeletonLoader';
import fileUploadImage from '../../../assets/forward-consent-form/treatment-placeholder.svg';
import Dropzone from 'react-dropzone';
import CustomCheckbox from '../../custom-components/custom-checkbox/CustomCheckbox';
import { ReactComponent as PreviewIcon } from '../../../assets/forward-consent-form/preview.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/forward-consent-form/delete.svg';
import CustomModal from '../../modal/CustomModal';
import { Toaster, toast } from 'react-hot-toast';
import { UpdateClientDetailsForwardConsentFormMutation } from '../../redux/actions/forward-consent-form/updateClientDetailsConsentForm';
import { getCountryCallingCode } from 'react-phone-number-input/input';
import { ForwardConsentFormQuestionsQuery } from '../../redux/actions/forward-consent-form/getConsentFormQuestions';
import { AvailalbePaymentMethodQuery } from '../../redux/actions/forward-consent-form/getPaymentMethodAvailable';
import { SaveForwardConsentFormMutation } from '../../redux/actions/forward-consent-form/saveForwardConsentForm';
import moment from 'moment';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import SuccessModal from '../../modal/SuccessModal';
import {
    SendFinanceRequest,
    getPaylaterStatus,
    setPaylaterData,
} from '../../redux/actions/pay-later/payLaterAction';
import {
    CLEAR_FORWARD_CONSENT_FORM_BOOKING_OVERVIEW,
    CLEAR_SELECTED_PAYMENT_OPTION,
    GET_SELECTED_PAYMENT_OPTION,
} from '../../redux/constants/forward-consent-form/ForwardConsentFormConst';
import { GetRyftPaymentToken } from '../../redux/actions/treatmentBooking/createTreatmentBooking';
import RyftComponent from '../../ryft/RyftComponent';
import { SaveStripeCardDetailsMutation } from '../../redux/actions/forward-consent-form/saveStripeCardDetails';
import { PayLaterRequest } from '../../redux/actions/pay-later/PayLater';
import { frontendURL } from '../../../config';
import PayLater from '../../payl8r/PayLater';
import ClientSideReviewModal from '../../forward-consent-form/clientReview/ClientSideReview';
import { GetClientSecretSetupIntentQuery } from '../../redux/actions/forward-consent-form/getClientSecretSetupIntent';
import treatmentPhotoModalIcon from '../../../images/upload-photo-treatment-icon.png';
import beforePhotoMiniIcon from '../../../images/beforPhotoMiniIcon.png';
import { businessDashboardRoutePattern } from '../../../Routes';
import CloseIcon from '../../../images/icons/Back.svg';
import { AddIdentityForwardConsentFormMutation } from '../../redux/actions/forward-consent-form/addClientIdForConsentForm';
import { DeleteIdentityForwardConsentFormMutation } from '../../redux/actions/forward-consent-form/deleteClientIdForConsentForm';
import { CompleteForwardConsentFormPaymentBooking } from '../../redux/actions/forward-consent-form/ForwardConsentFormBooking';
import Lottie from 'react-lottie';
import thankAnimation from '../../../assets/lottieanimation/Animation - 1712039535881.json';
import thankyou from '../../../images/thank-you/success.svg';
import { GetRyftPaymentTokenForwardConsentFormQuery } from '../../redux/actions/forward-consent-form/getRyftPaymentTokenForwardConsentForm';
import { ReactComponent as RightArrow } from '../../../images/icons/chevron-left.svg';
import IdentityIcon from '../../../images/icons/identitydoc.svg';
import timeIcon1 from '../../../images/icons/ComplianceTime1.svg';
import timeIcon2 from '../../../images/icons/ComplianceTime2.svg';
import loadingIcon from '../../../images/loading.gif';
import { ReactComponent as Photo } from '../../../images/icons/photo.svg';
import EraseImg from '../../../images/new-appointment/erase.png';
import { ReactComponent as UndoEnableIcon } from '../../../images/new-appointment/undo_enable.svg';
import { ReactComponent as UndoIcon } from '../../../images/new-appointment/undo.svg';
import { ReactComponent as EnableCheck } from '../../../images/new-appointment/enable_check.svg';
import { ReactComponent as EnableSignIcon } from '../../../images/new-appointment/active_sign.svg';
import { ReactComponent as EmptySignIcon } from '../../../images/new-appointment/empty_sign.svg';
import NavHeader from '../../common/NavHeader/NavHeader';
import loaderIcon from '../../../images/icons/loader/loader.gif';
import TextInput from '../../common/TextInput';
import { ForwardConsentFormOverviewQuery, useForwardConsentFormCustomActions } from '../../redux/actions/forward-consent-form/getConsentFormBookingDetails';
import ProfileImage from '../../../assets/forward-consent-form/profile.jpeg';
import { ReactComponent as StarIcon } from '../../../assets/forward-consent-form/StarIcon.svg';
import { RemoveBeforeAfterPhotoAction } from '../../redux/actions/appointments/RemoveBeforeAfterPhoto';
import showToast from '../../common/CustomToast/CustomToast';
import Avatar from 'react-avatar';
import { last } from 'lodash';
import { GetWalkInConsentQA } from '../../redux/actions/walk-in-consent-qa/walkInConsentQA';



const ForwardConsentForm = () => {
    //============= GRAPHQL DECLARATION START=================
    const [show, setShow] = useState(false);
    const [isManuallyModal, setIsManuallyModal] = useState(false);

    const [submitClientAfterAddress, setSubmitClientAfterAddress] = useState(false);
    const [isSearchNewUpdate, setIsSearchNewUpdate] = useState(false)
    //LOTTIE ANIMATION SETTING
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: thankAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    };
    //============= QUERY =======================
    //GET OVERVIEW DETAILS
    const { forwardConsentFormOverviewQueryData: {
        loading: forwardConsentFormOverviewLoading,
        called: forwardConsentFormOverviewCalled,
    }, initForwardConsentFormOverview } =
        ForwardConsentFormOverviewQuery();

    //UPDATE OVERVIEW DETAILS
    const {
        updateClientDetailsForwardConsentFormData,
        initiateUpdateClientDetailsForwardConsentForm,
    } = UpdateClientDetailsForwardConsentFormMutation();
    //GET QUESTIONS LIST
    const { initWalkInConsentQA, walkInConsentQAQueryData: {
        loading: walkInConsentQALoading,
        called: walkInConsentQACalled,
    } } = GetWalkInConsentQA()
    //GET PAYMENT METHOD AVAILABLE
    const { paymentMethodAvailableQueryData, initPaymentMethodAvailable } =
        AvailalbePaymentMethodQuery();
    //SAVE CONSENT FORM DATA MUTAION
    const { saveForwardConsentFormData, initiateSaveForwardConsentForm } =
        SaveForwardConsentFormMutation();
    //ADD CLIENT IDENTITY
    const { addIdentityForwardConsentFormData, initiateAddIdentityForwardConsentForm } =
        AddIdentityForwardConsentFormMutation();
    //DELETE CLIENT IDENTITY
    const { deleteIdentityForwardConsentFormData, initiateDeleteIdentityForwardConsentForm } =
        DeleteIdentityForwardConsentFormMutation();
    //SAVE PAYMENT
    const {
        initiateCompleteForwardConsentFormPaymentBooking,
        completeForwardConsentFormPaymentBookingMutationData,
    } = CompleteForwardConsentFormPaymentBooking();
    //RYFT AND STRIP QUERY
    // const { getRyftPaymentQueryData, initRyftPaymentToken } = GetRyftPaymentToken()
    const { initRyftTokenForwardConsentFormToken, getRyftTokenForwardConsentFormQueryData } =
        GetRyftPaymentTokenForwardConsentFormQuery();
    //FOR PAYLE8R QUERY REQUEST
    const { initiatePayLaterRequest, payLaterMutationData } = PayLaterRequest();

    //NOTIFY FINANCE REQ SEND
    const { initiatesendFinance, sendFinanceMutationData } = SendFinanceRequest();

    //GET PAYMENT INTENT FOR PAY FOR THE DAY
    const { initClientSecretSetupIntent, clientSecretSetupQueryData } =
        GetClientSecretSetupIntentQuery();

    //============= GRAPHQL DECLARATION END=================

    //=================== REDUCER DATA=====================

    //FOR CLIENT DETAILS
    const { appointmentDetails } = useSelector((state) => state?.forwardConsentFormOverviewReducer);
    const { clientDetailsData } = useSelector((state) => state?.forwardConsentFormOverviewReducer);
    const { paymentSummary } = useSelector((state) => state?.forwardConsentFormOverviewReducer);
    const { treatmentDetails } = useSelector((state) => state?.forwardConsentFormOverviewReducer);
    const { paymentStatusData } = useSelector((state) => state?.forwardConsentFormOverviewReducer);
    const { selectedPaymentOptionData } = useSelector(
        (state) => state?.forwardConsentFormOverviewReducer
    );
    console.log('selectedPaymentOptionData', selectedPaymentOptionData);
    console.log("getform", treatmentDetails)
    const { isConsentFormDone } = useSelector((state) => state?.forwardConsentFormOverviewReducer);
    const { isConsentFormPaymentDone } = useSelector(
        (state) => state?.forwardConsentFormOverviewReducer
    );
    const { isClientDone } = useSelector((state) => state?.forwardConsentFormOverviewReducer);
    const { reviewAdded } = useSelector((state) => state?.forwardConsentFormOverviewReducer);
    const { fullName } = useSelector((state) => state?.forwardConsentFormOverviewReducer);

    //QUESTION LIST  & DISCLAIMERS REDUCER DATA
    // const { questionsList } = useSelector((state) => state?.forwardConsentFormQuestionsReducer);
    // const questionsList = [
    //     {question: "Have you taken this treatment before?"}
    // ];
    // const { disclaimersList } = useSelector((state) => state?.forwardConsentFormQuestionsReducer);

    //QUESTION LIST  & DISCLAIMERS REDUCER DATA
    const walkInConsentQAData = useSelector(state => state?.walkInConsentQAReducer?.questionAnswerData)
    console.log('walkInConsentQAData', walkInConsentQAData)
    const [questionsList, setQuestionsList] = useState([]);
    const [disclaimersList, setDisclaimersList] = useState([]);
    useEffect(() => {
        setQuestionsList(walkInConsentQAData?.questions || [])
        setDisclaimersList(walkInConsentQAData?.disclaimerData || [])
        setIsAdvertisement(walkInConsentQAData?.allowForAdvertisement || 0)
    }, [walkInConsentQAData])
    console.log('questionsListtt', questionsList, disclaimersList)

    //PAYMENT METHOD AVALIABLE DATA
    const { paymentMethodAvailableDetails } = useSelector(
        (state) => state?.paymentMethodAvailableReducer
    );
    console.log("data", paymentStatusData)
    //FOR PAYMENT REDUCER
    const sessionToken = useSelector(
        (state) => state?.getForwardConsentFormBookingTokenReducer?.forwardConsentBookingToken
    );
    //const sessionToken = useSelector(state => state?.treatmentBookingreducer?.treatmentBookingToken)
    //const treatmentBookingAccountId = useSelector(state => state?.treatmentBookingreducer?.treatmentBookingAccountId)
    const forwardConsentBookingAccountId = useSelector(
        (state) => state?.getForwardConsentFormBookingTokenReducer?.forwardConsentBookingAccountId
    );

    //GET CLIENT SECRET FROM PAYONTHEDAY
    const { clientSecret } = useSelector((state) => state?.clientSecretSetupIntentReducer);

    //FOR SEND REUEST QUERY
    const paylaterEnable = useSelector((state) => state.payLaterReducer.payLaterEnable);

    const { clientSignature, notes, userTotalReviews, averageRating, userFirstName, userLastName, userProfile, userId } = useSelector((state) => state?.forwardConsentFormOverviewReducer);

    //DISPATCH
    const dispatch = useDispatch();

    //NAVIGATE
    const navigate = useNavigate();
    //DUMMY QUESTION DATA
    const questionData = [
        {
            id: 1,
            question: 'This is a question that requires a yes or no answer?',
        },
        {
            id: 2,
            question: 'Do you have any allergies?',
        },
        {
            id: 3,
            question: 'This is a question that requires a yes or no answer?',
        },
        {
            id: 4,
            question: 'Do you have any allergies?',
        },
    ];

    //=================STATE DECLARATION=================
    const [step, setStep] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
    const [clientDetails, setClientDetails] = useState({
        clientName: '',
        email: '',
        phoneNumber: '',
        birthDay: '',
        address: '',
        phoneCountry: '',
    });
    const [clientSubmitInitiated, setClientSubmitInitiated] = useState(false);
    const { bookingId } = useParams();
    const searchParams = new URLSearchParams(window.location.search);
    //for error purpose
    const [validationErrors, setValidationErrors] = useState({
        clientName: '',
        phonePrefix: '',
        phoneNumber: '',
        email: '',
        countryCode: '',
    });

    //Set Search Location state
    const [searchLocation, setSearchLocation] = useState('');
    const [prevSearchLocation, setPrevSearchLocation] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    //Set Client Location state
    const [location, setLocation] = useState({
        address1: '',
        address2: '',
        city: '',
        postcode: '',
        country: '',
        street: '',
        house_no: '',
        latitude: 0.0,
        longitude: 0.0,
        state: '',
    });

    const [countryCode, setCountryCode] = useState('GB');

    //FILE UPLOAD
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fileUploading, setFileUploading] = useState(false);
    const [previewTreatmentPhoto, setPreviewTreatmentPhoto] = useState('');
    const [treatmentPreviewModal, setTreatmentPreviewModal] = useState(false);
    const [isDeleteModal, setIsDeleteModal] = useState(false);
    const [treatmentPhotoModal, setTreatementPhotoModal] = useState(false);
    // Add a state to hold the index of the file to be deleted
    const [fileToDeleteIndex, setFileToDeleteIndex] = useState(null);

    //MODAL STATE
    const [openClientDetailsModal, setOpenClientDetailsModal] = useState(false);

    const [dobError, setDobError] = useState(false);
    const [dobValue, setDobValue] = useState('');
    //SIGNATURE STATE
    const [trimmedDataURL, setTrimmedDataURL] = useState(null);
    const signRef = useRef(null);
    const signatureRef = useRef(null);
    //BIRTHDAY STATE
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');

    console.log("client detail dob", dobValue, day, month, year);

    //INVALID TOKEN OR BOOKING ID MESSAGE
    const [reponseMessage, setReponseMessage] = useState('');

    //SHOW HIDE PAYMENT OPTIONS
    const [paymentOptions, setPaymentOptions] = useState({
        payInFull: false,
        payDeposit: false,
        payOnTheDay: false,
        payMonthly: false,
    });

    const [selectedAnswers, setSelectedAnswers] = useState([]);

    //Adverticesment
    const [isAdvertisement, setIsAdvertisement] = useState(false);
    const handleAdvertisement = () => {
        setIsAdvertisement(!isAdvertisement);
    };

    //PAYMENT SUMMARY
    const [totalAmount, setTotalAmount] = useState(null);
    const [totalDeposit, setTotalDeposit] = useState(null);
    const [totalPayble, setTotalPayble] = useState(null);
    const [totalDue, setTotalDue] = useState(null);
    const [totalDiscount, setTotalDiscount] = useState(null);

    //FOR PAYL8R STATE
    const [requestSendModal, setRequestSendModal] = useState(false);
    const [payLaterData, setPayLaterData] = useState(null);
    const [openPayLater, setOpenPayLater] = useState(null);

    //FOR REVIEW MODAL STATE
    const [reviewModal, setReviewModal] = useState(false);

    //TREATMENT MODAL STATE
    const [treatmentData, setTreatmentData] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [tempSelectedFiles, setTempSelectedFiles] = useState([]);
    const [tempAcceptedFiles, setTempAcceptedFiles] = useState([]);

    const [treatmentPhotoLengths, setTreatmentPhotoLengths] = useState([]);

    //CLIENT ID MODAL
    const [clientIdModal, setClientIdModal] = useState(false);
    const [clientIdFile, setClientIdFile] = useState(null);
    const [clientIdBase64, setClientIdBase64] = useState('');
    const clientIdRef = useRef(null);
    const [isIdentityCalled, setIsIdentityCalled] = useState(false);

    //SHO HIDE PAY BUTTON FOR PAY MONTHLY
    const [isPayMonthButton, setIsPayMonthButton] = useState(true);
    //FOR NOTE
    const [note, setNote] = useState('');
    //FOR Ryft Response Success
    const [ryftResponseSuccess, setRftResponseSuccess] = useState(null);
    const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
    const [selectedImageData, setSelectedImageData] = useState(false);
    const [isSignatureOpen, setIsSignatureOpen] = useState(false);
    const [isSigned, setIsSigned] = useState(null);
    const [signedSignatureData, setSignedSignatureData] = useState(null);
    const [previewDataURL, setPreviewDataURL] = useState(null);
    const [tempTrimmedDataURL, setTempTrimmedDataURL] = useState(null);
    const [toggleSigned, setToggleSigned] = useState(false);
    const [progressbarStatus, setProgressbarStatus] = useState(null);
    const [isPopUpTrue, setIsPopUpTrue] = useState(false)
    const [isDone, setIsDone] = useState(false)
    const [financeOption, setFinanceOption] = useState(null)
    const sigPadRef = useRef();

    const {
        forwardedConsentFormClientStepCompleted,
        forwardedConsentFormConsentStepCompleted,
        forwardedConsentFormPaymentStepCompleted,
    } = useForwardConsentFormCustomActions();

    const { initRemoveBeforeAfterPhotoData, removeBeforeAfterPhotoQueryData: {
        loading: removeBeforeAfterPhotoLoading,
        called: removeBeforeAfterPhotoCalled
    } } = RemoveBeforeAfterPhotoAction();

    //==============FUNCATION DECLARATION====================
    const handleOptionChange = (index, option, comment, question) => {
        console.log(index, 'option change', option, comment, question, selectedOptions);
        // setSelectedOptions(prevOptions => {
        //     let newOptions=[...prevOptions];
        //     newOptions[index] = {option,comment,question};
        //     return newOptions;
        // });
        let temp = selectedOptions;
        let obj = selectedOptions[index];
        obj.answerNew = option;
        obj.comment = comment;
        obj.question = question;
        // temp[index] = obj;
        temp = temp.map((item, tempIndex) => {
            if (tempIndex == index) {
                item = {
                    ...obj
                };
            }
            return item;
        })
        console.log(index, 'after update option change', temp);
        setSelectedOptions(temp);
        setSelectedAnswers(temp);
        // setSelectedOptions(temp)
    };
    console.log('selected options', appointmentDetails);

    useEffect(() => {
        if (searchLocation?.length === 0) {
            setLocation("")
        }
    }, [searchLocation])

    const removeFileNames = (uploadedFiles) => {
        const base64StringsByTreatmentId = {};
        uploadedFiles?.forEach((item) => {
            const treatmentId = item.treatmentId;
            if (!base64StringsByTreatmentId[treatmentId]) {
                base64StringsByTreatmentId[treatmentId] = [];
            }
            item?.imagesBase64?.forEach((image) => {
                const base64WithoutPrefix = image?.base64?.split(',')[1]; // Remove prefix
                base64StringsByTreatmentId[treatmentId].push(base64WithoutPrefix);
            });
        });

        // Convert the object into an array of objects with the specified structure
        const result = [];
        for (const treatmentId in base64StringsByTreatmentId) {
            result.push({
                treatmentId: parseInt(treatmentId), // Convert treatmentId to integer if necessary
                imagesBase64: base64StringsByTreatmentId[treatmentId],
            });
        }

        return result;
    };

    const handleFileUpload = (acceptedFiles, treatmentId, index) => {
        console.log('accepted files: ', acceptedFiles, index, treatmentId);
        const imageFiles = acceptedFiles.filter((file) => file.photoUrl || file.type.startsWith('image/'));
        setTempAcceptedFiles(imageFiles);

        // Check if there are any non-image files
        const nonImageFiles = acceptedFiles.filter((file) => !file.photoUrl && !file?.type?.startsWith('image/'));

        // If there are non-image files, display an error message
        if (nonImageFiles?.length > 0) {
            toast.error('Please select only image files.....');
            return; // Stop further processing
        }
        setTempSelectedFiles((prevUploadedFiles) => {
            const updatedFiles = prevUploadedFiles?.map((item) => {
                if (item.treatmentId === treatmentId) {
                    const newTreatmentPhoto = [...item.treatmentPhoto];
                    if (index >= 0 && index < newTreatmentPhoto?.length) {
                        // Ensure index is within bounds
                        newTreatmentPhoto[index] = acceptedFiles[0]; // Assuming you're replacing the existing file
                    } else {
                        // If index is out of bounds, push the file to the end
                        newTreatmentPhoto.push(acceptedFiles[0]);
                    }
                    return {
                        ...item,
                        treatmentPhoto: newTreatmentPhoto,
                    };
                }
                return item;
            });
            // After updating the files, calculate the length of treatmentPhoto arrays with files
            const lengths = updatedFiles.map((item) => ({
                treatmentId: item.treatmentId,
                photoCount: item.treatmentPhoto.filter((file) => file !== undefined)?.length, // Count files that are not undefined
            }));
            setTreatmentPhotoLengths(lengths);
            return updatedFiles;
        });
        const clinicName = 'hello';

        // Get the existing uploaded files for the treatment ID
        const existingFiles = uploadedFiles.find((item) => item.treatmentId === treatmentId) || {
            imagesBase64: [],
        };
        // Convert each image file to base64 and include file name
        // Promise.all(imageFiles.map(file => {
        //     return new Promise((resolve, reject) => {
        //         const reader = new FileReader();
        //         reader.onload = () => {
        //             resolve({
        //                 name: file.name,
        //                 base64: reader.result
        //             });
        //         };
        //         reader.onerror = reject;
        //         reader.readAsDataURL(file);
        //     });
        // }))
        //     .then(base64Images => {
        //         // Update the uploadedFiles state with the new files for the treatment ID
        //         setUploadedFiles(prevUploadedFiles => {
        //             const updatedFiles = prevUploadedFiles?.map(item => {
        //                 if (item.treatmentId === treatmentId) {
        //                     return {
        //                         ...item,
        //                         imagesBase64: [...item.imagesBase64, ...base64Images]
        //                     };
        //                 }
        //                 return item;
        //             });

        //             // If the treatment ID doesn't exist in the uploadedFiles state, add it with the new files
        //             if (!updatedFiles.some(item => item.treatmentId === treatmentId)) {
        //                 updatedFiles.push({
        //                     treatmentId,
        //                     imagesBase64: base64Images
        //                 });
        //             }

        //             return updatedFiles;
        //         });
        //     })
        //     .catch(error => {
        //         console.error('Error converting files to base64:', error);
        //         toast.error('Error converting files to base64');
        //     });
    };

    //HANDLE REMOVE TREATMENT PHOTOS
    const handleRemovePhoto = (treatmentId, index) => {
        setSelectedFiles((prevSelectedFiles) => {
            const updatedFiles = prevSelectedFiles.map((item) => {
                if (item.treatmentId === treatmentId) {
                    const newTreatmentPhoto = [...item.treatmentPhoto];
                    newTreatmentPhoto[index] = undefined; // Mark the photo as undefined to remove it
                    return {
                        ...item,
                        treatmentPhoto: newTreatmentPhoto,
                    };
                }
                return item;
            });
            return updatedFiles;
        });

        const newFiles = uploadedFiles.map((file) => {
            if (file.treatmentId === treatmentId) {
                return {
                    ...file,
                    imagesBase64: file.imagesBase64.filter((_, i) => i !== index),
                };
            }
            return file;
        });
        // Update the state with the new files array
        setUploadedFiles(newFiles);
    };

    console.log('uploading files...new', clientIdBase64);
    //HANDLE PAYMENT OPTION CHANGE
    // console.log(paymentStatusData[0]?.finance_options===0 && !paymentStatusData[0]?.is_finance_available,"12345");
    const handlePaymentOptionChange = (option) => {
        if (
            // (paymentStatusData[0]?.user_payl8tr_status == 0 ||
            //     paymentStatusData[0]?.user_payl8tr_status == 1) &&
            option == 'Pay Monthly'
        ) {
            console.log("selectedPaymentOption handlePaymentOptionChange pay monthly", paymentStatusData[0]);
            if (!paymentStatusData[0]?.is_finance_available) {
                if (paymentStatusData[0]?.finance_options == 0) {
                    sendRequestForPayl8r();
                }
                else if (paymentStatusData[0]?.finance_options === 1) {
                    setRequestSendModal(true);
                }
            }
            else {
                dispatch({
                    type: GET_SELECTED_PAYMENT_OPTION,
                    payload: option,
                });
                setSelectedPaymentOption(option);
            }

        } else {
            dispatch({
                type: GET_SELECTED_PAYMENT_OPTION,
                payload: option,
            });
            setSelectedPaymentOption(option);
        }
    };

    useEffect(() => {
        if (!trimmedDataURL && !signedSignatureData) {
            if (signatureRef.current) {
                signatureRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                })
            }
        }
    }, [signatureRef, trimmedDataURL, signedSignatureData])

    //HANDLE NEXT BUTTON
    const handleNext = () => {
        const newAnswer = selectedAnswers?.map((ans) => {
            // let answerNew = -1;
            // if (ans?.answer == 'Yes') {
            //     answerNew = 1;
            // } else if (ans?.answer == 'No') {
            //     answerNew = 0;
            // }
            return { ...ans, answer: ans?.answer == 'Yes' ? true : false, answerNew: ans?.answerNew };
        });
        if (!trimmedDataURL && !signedSignatureData) {
            if (signatureRef.current) {
                signatureRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                })
            }
        }
        if (!trimmedDataURL && !signedSignatureData) {
            toast.error('Please add signature');
            return;
        }
        let uploadData = {
            cfrId: parseInt(bookingId),
            token: searchParams.get('token'),
            treatmentsData: removeFileNames(uploadedFiles),
            allowForAdvertisement: isAdvertisement ? 1 : 0, // 0 for FALSE, 1 for TRUE,
            signatureBase64: trimmedDataURL ? trimmedDataURL?.split(',')[1] : "",
            questionsAndAnswer: newAnswer,
            notes: note,
            //selectedPayment: selectedPaymentOption === "Pay in full" ? "PAY_In_FULL" : selectedPaymentOption == "Pay Deposit" ? "PAY_DEPOSIT" : selectedPaymentOption == "Pay on the Day" ? "PAY_ON_THE_DAY" : selectedPaymentOption == "Pay Monthly" ? "PAY_MONTHLY" : null, //Pay in full  Pay Deposit Pay on the Day Pay Monthly
        };
        initiateSaveForwardConsentForm(
            uploadData,
            (res) => {
                if (res?.success) {
                    toast.success(res?.message);
                    if (uploadData.treatmentsData?.length) {
                        fetchForwardedConsentFormOverview();
                    }
                    if (isConsentFormPaymentDone) {
                        forwardedConsentFormPaymentStepCompleted();
                        setStep(4);
                    } else {
                        forwardedConsentFormConsentStepCompleted();
                        setStep(3);
                    }
                } else {
                    toast.error(res?.message);
                }
                console.log('save consent form', res);
            },
            (err) => {
                console.log('save consent form error', err);
            }
        );
    };
    console.log("location", location)
    //HANDLE EDIT BUTTON
    const handleEdit = () => {
        if (step == 2) {
            setOpenClientDetailsModal(false);
        } else {
            setOpenClientDetailsModal(true);
        }
    };

    function isValidEmail(email) {
        const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        return emailPattern.test(email);
    }

    //VALIDATION
    const validateInput = (name, value) => {
        let validInput = true;
        switch (name) {
            case 'clientName':
                if (!value) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        clientName: 'Client name is required',
                    }));
                    validInput = false;
                } else {
                    if (/\d/.test(value)) {
                        setValidationErrors((prev) => ({
                            ...prev,
                            clientName: 'Invalid client name',
                        }));
                        validInput = false;
                    } else {
                        setValidationErrors((prev) => ({
                            ...prev,
                            clientName: '',
                        }));
                    }
                }
                break;
            case 'email':
                if (!value || !isValidEmail(value)) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        email: 'Valid email is required',
                    }));
                    validInput = false;
                } else {
                    setValidationErrors((prev) => ({
                        ...prev,
                        email: '',
                    }));
                }
                break;
            case 'phoneNumber':
                const numericValue = value?.replace(/[^0-9]/g, '');
                if (numericValue?.length < 10 || numericValue?.length > 15) {
                    setValidationErrors((prev) => ({
                        ...prev,
                        phoneNumber: 'Valid phone number should contain 10 to 15 digits',
                    }));
                    validInput = false;
                } else {
                    setValidationErrors((prev) => ({
                        ...prev,
                        phoneNumber: '',
                    }));
                }
                break;
            case 'country':

            default:
                break;
        }
        return validInput;
    };
    console.log("validationErrors", validationErrors, dobError)
    const [compareAddress, setCompareAddress] = useState({
        lat: "",
        long: ""
    })

    //HANDLE OVERVIEW SUBMIT BUTTON
    const handleContinue = () => {
        let formReadyForSubmit = true;
        // const validationErrors = {};
        // if (!clientDetails.clientName) {
        //     validationErrors.clientName = 'Client name is required';
        // }
        // if (!clientDetails.email || !isValidEmail(clientDetails.email)) {
        //     validationErrors.email = 'Valid email is required';
        // }

        // setValidationErrors(validationErrors);

        setIsManuallyModal(true)
        if (!validateInput('clientName', clientDetails.clientName)) {

            formReadyForSubmit = false;
        }
        if (!validateInput('email', clientDetails.email)) {

            formReadyForSubmit = false;
        }
        if (!validateInput('phoneNumber', clientDetails.phoneNumber)) {

            formReadyForSubmit = false;
        }



        if (!dobValue) {

            formReadyForSubmit = false;
        }

        // if (Object.values(validationErrors).some((error) => error) || dobError) {
        //     return;
        // }

        if (location.address1 && (location.street || location.address2) && (location.house_no || location.address1) && (location.city) && (location?.postcode)) {
            // setIsDone(false)
            if (isPopUpTrue) {
                setIsManuallyModal(false);
            }
            setIsManuallyModal(true);

        }
        else {
            if (!formReadyForSubmit) {
                setIsManuallyModal(false);
            }
            else if (formReadyForSubmit) {
                setIsManuallyModal(true);
            }
            // setIsManuallyModal(true);
            formReadyForSubmit = false;
            setIsPopUpTrue(false)
            // toast.error("Please select your address");
        }
        setClientSubmitInitiated(true);



        if (!formReadyForSubmit) {

            return;
        }
        // submitClientDetails()
        setSubmitClientAfterAddress(true);
    };
    console.log("LLLLL", compareAddress)

    const submitClientDetails = () => {
        const newDataName = clientDetails?.clientName.split(' ');
        setSubmitClientAfterAddress(false);
        initiateUpdateClientDetailsForwardConsentForm(
            {
                cfrId: parseInt(bookingId),
                token: searchParams.get('token'),
                clientName: clientDetails.clientName,
                email: clientDetails.email,
                phone: clientDetails.phoneNumber,
                address: location.address1,
                country: countryCode,
                phoneCountry: getCountryCallingCode(countryCode),
                dob: dobValue,
                street: location.street || location.address2,
                houseNumber: location.house_no || location.address1,
                city: location.city,
                postCode: location?.postcode?.toString(),
                appointmentId: appointmentDetails?.appointmentId,
            },
            (res) => {

                if (res.success) {
                    setClientDetails({
                        ...clientDetails,
                        // clientName: clientDetails.clientName,
                        // email: clientDetails.email,
                        // phoneNumber: clientDetails.phoneNumber,
                        // phoneCountry: getCountryCallingCode(res?.data?.country),
                        birthDay: dobValue,
                        // address: searchLocation,
                    });

                    forwardedConsentFormClientStepCompleted();

                    toast.success(res?.message);
                    setOpenClientDetailsModal(false);

                    setStep(2);
                } else {
                    toast.error(res?.message);
                    // setOpenClientDetailsModal(true);
                }
            },
            (err) => {
                toast.error(err);
            }
        );
    }

    console.log('client datails', clientDetails);
    //FOR OPEN PREVIEW TREATMENT PHOTOS
    const handlePreview = (file) => {
        setPreviewTreatmentPhoto(file);
        setTreatmentPreviewModal(true);
    };

    //FOR DELETE PREVIEW TREATMENT PHOTOS
    const handleDelete = (treatmentId, fileIndex, file) => {
        // setFileToDeleteIndex(index);
        setFileToDeleteIndex({ treatmentId, fileIndex, file });
        setIsDeleteModal(true);
    };

    //CONFIRM DELETE PREVIEW TREATMENT PHOTOS
    const handleConfirmDelete = () => {
        if (fileToDeleteIndex == null) {
            initiateDeleteIdentityForwardConsentForm(
                {
                    cfrId: parseInt(bookingId),
                    token: searchParams.get('token'),
                },
                (res) => {
                    console.log('res delete', res);
                    if (res?.success) {
                        setClientIdModal(false);
                        setClientIdFile(null);
                        setClientIdBase64('');
                        setIsDeleteModal(false);
                    } else {
                        setClientIdModal(true);
                        toast.error(res?.message);
                    }
                },
                (err) => {
                    console.log('res delete error', err);
                }
            );
        } else {
            const { treatmentId, fileIndex, file } = fileToDeleteIndex;

            const removePreviewFiles = () => {
                setTempSelectedFiles((prevSelectedFiles) => {
                    const updatedFiles = prevSelectedFiles.map((item) => {
                        if (item.treatmentId === treatmentId) {
                            const newTreatmentPhoto = [...item.treatmentPhoto];
                            newTreatmentPhoto[fileIndex] = undefined; // Mark the photo as undefined to remove it
                            return {
                                ...item,
                                treatmentPhoto: newTreatmentPhoto,
                            };
                        }
                        return item;
                    });
                    return updatedFiles;
                });
                setSelectedFiles((prevSelectedFiles) => {
                    const updatedFiles = prevSelectedFiles.map((item) => {
                        if (item.treatmentId === treatmentId) {
                            const newTreatmentPhoto = [...item.treatmentPhoto];
                            newTreatmentPhoto[fileIndex] = undefined; // Mark the photo as undefined to remove it
                            return {
                                ...item,
                                treatmentPhoto: newTreatmentPhoto,
                            };
                        }
                        return item;
                    });
                    return updatedFiles;
                });

                const newFiles = uploadedFiles?.map((file) => {
                    if (file.treatmentId === treatmentId) {
                        return {
                            ...file,
                            imagesBase64: file?.imagesBase64?.filter((_, i) => i !== fileIndex),
                        };
                    }
                    return file;
                });
                // Update the state with the new files array
                setUploadedFiles(newFiles);
                // Reset the fileToDeleteIndex state
                setFileToDeleteIndex(null);
                // Close the delete modal
                setIsDeleteModal(false);
            }
            if (file && file.photoId) {
                initRemoveBeforeAfterPhotoData({
                    photoId: file.photoId,
                }, (res) => {
                    if (res.success) {
                        removePreviewFiles();
                        // toast.error(res?.message);
                        showToast("success", res.message, false, "")
                    } else {
                        console.log("res", res.message)
                        // toast.error(res?.message);
                        showToast("error", res.message, false, "")
                    }
                }, (err) => {

                })
            }
            else {
                removePreviewFiles();
            }
        }
    };

    //GET TOTAL PRICE AFTER DISCOUNT
    const getTotalPriceAfterDiscount = (fixed = 0) => {
        // return (paymentSummary?.totalAmount - parseFloat(paymentSummary?.discountAmount)).toFixed(
        //     fixed
        // );
        return (paymentSummary?.totalAppointmentAmount);
    };
    console.log("userId", userId)
    //FOR PAYL8R TO SEND REQUEST
    const sendRequestForPayl8r = () => {
        initiatesendFinance(
            {
                clinicId: parseInt(userId),
                requestMail: false, //sending false because this flag is for user to turn on finance toggle but user is not registered yet
                cfrId: parseInt(bookingId),
            },
            (data) => {
                console.log(data);
                setRequestSendModal(true);
                // setSelectedPaymentOption(null);
            },
            (error) => {
                console.log("BIGERROR", error)
                // alert('Something went wrong!');
            }
        );
    };

    //FOR HANDLE TREATMENT PHOTO MODAL
    const handleTreatmentPhotoModal = (treatment) => {
        setTreatementPhotoModal(true);
        setTreatmentData(treatment);
    };

    const handleClientId = () => {
        if (clientIdFile == null) {
            clientIdRef?.current?.click();
        } else {
            setClientIdModal(true);
        }
    };

    const handleFileClientIdChange = (event) => {
        console.log('fileToDeleteIndex', fileToDeleteIndex);
        const selectedFile = event.target.files[0];

        if (selectedFile && selectedFile.type.startsWith('image/')) {
            //setClientIdFile(selectedFile)
            // Create a FileReader instance
            const reader = new FileReader();
            // Set up onload callback function
            reader.onload = () => {
                // Use the result property of the FileReader object which contains the file's data as a data URL
                let base64String = reader.result;
                // Do something with the base64 string, such as set it to state
                base64String = base64String.substring(base64String.indexOf(',') + 1);
                // Do something with the base64 string, such as set it to state
                setClientIdBase64(base64String);
                initiateAddIdentityForwardConsentForm(
                    {
                        cfrId: parseInt(bookingId),
                        token: searchParams.get('token'),
                        clientIDbase64: base64String,
                    },
                    (res) => {
                        if (res?.success) {
                            console.log('res documenr', res?.data?.docUrl);
                            setClientIdFile(res?.data?.docUrl);
                            toast.success(res.message);
                            setIsIdentityCalled(true);
                            fetchForwardedConsentFormOverview();
                        } else {
                            setClientIdFile(null);
                            toast.error(res?.message);
                        }
                        // console.log('base64 err', err?.message);
                    },
                    (err) => {
                    }
                );
            };

            // Read the selected file as a data URL
            reader.readAsDataURL(selectedFile);
            // Do something with the selected file
        } else {
            // Handle error: File is not an image
            toast.error('Select only image file');
            setClientIdFile(null);
            setClientIdBase64('');
        }
    };

    const handleClientIdDelete = () => {
        setIsDeleteModal(true);
    };

    //HANDLE BYPASS WHEN NO METHOD AVAILABLE
    const handleByPassPayment = () => {
        initiateCompleteForwardConsentFormPaymentBooking(
            {
                bookingId: parseInt(bookingId),
                cfrToken: searchParams?.get('token'),
            },
            (res) => {
                if (res.success) {
                    setStep(3);
                } else {
                    setStep(2);
                    toast.error(res.message);
                }
            },
            (e) => {
                setStep(2);
                toast.error(e.message);
            }
        );
    };

    //SAVE TREATMENT PHOTO WHEN CLICK ON SAVE
    const handleSaveTreatmentPhoto = () => {
        setSelectedFiles(tempSelectedFiles);

        // Iterate through each item in tempUploadFile state
        const treatmentId = treatmentData?.treatmentId;
        // Convert each image file to base64 and include file name
        // Promise.all(tempAcceptedFiles?.map(file => {
        //     return new Promise((resolve, reject) => {
        //         const reader = new FileReader();
        //         reader.onload = () => {
        //             resolve({
        //                 name: file.name,
        //                 base64: reader.result
        //             });
        //         };
        //         reader.onerror = reject;
        //         reader.readAsDataURL(file);
        //     });
        // }))
        //     .then(base64Images => {
        //         // Update the uploadedFiles state with the new files for the treatment ID
        //         setUploadedFiles(prevUploadedFiles => {
        //             const updatedFiles = prevUploadedFiles?.map(item => {
        //                 if (item.treatmentId === treatmentId) {
        //                     return {
        //                         ...item,
        //                         imagesBase64: [...item?.imagesBase64, ...base64Images]
        //                     };
        //                 }
        //                 return item;
        //             });

        //             // If the treatment ID doesn't exist in the uploadedFiles state, add it with the new files
        //             if (!updatedFiles.some(item => item.treatmentId === treatmentId)) {
        //                 updatedFiles.push({
        //                     treatmentId,
        //                     imagesBase64: base64Images
        //                 });
        //             }

        //             return updatedFiles;
        //         });
        //     })
        //     .catch(error => {
        //         console.error('Error converting files to base64:', error);
        //         toast.error('Error converting files to base64');
        //     });

        const imageFiles = tempSelectedFiles.map((item) => ({
            treatmentId: item.treatmentId,
            treatmentPhoto: item.treatmentPhoto.filter(
                (file) =>
                    file && file.type && file.type.startsWith('image/')
            ),
        }));

        // Convert image files to base64
        const base64Promises = imageFiles.map((item) =>
            Promise.all(
                item.treatmentPhoto.map(
                    (file) =>
                        new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () =>
                                resolve({ name: file.name, base64: reader.result });
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        })
                )
            ).then((base64Images) => ({
                treatmentId: item.treatmentId,
                imagesBase64: base64Images,
            }))
        );

        Promise.all(base64Promises)
            .then((updatedFiles) => {
                // Update the uploadedFiles state with the new files for each treatment ID
                setUploadedFiles((prevUploadedFiles) => {
                    const updatedFilesState = prevUploadedFiles ? [...prevUploadedFiles] : [];
                    updatedFiles.forEach((updatedFile) => {
                        const index = updatedFilesState.findIndex(
                            (item) => item.treatmentId === updatedFile.treatmentId
                        );
                        if (index !== -1) {
                            // If treatment ID already exists, update the imagesBase64 array
                            const existingFilenames = updatedFilesState[index].imagesBase64.map(
                                (image) => image.name
                            );
                            const newImages = updatedFile.imagesBase64.filter(
                                (image) => !existingFilenames.includes(image.name)
                            );
                            updatedFilesState[index].imagesBase64.push(...newImages);
                        } else {
                            // If treatment ID doesn't exist, push a new object
                            updatedFilesState.push(updatedFile);
                        }
                    });
                    return updatedFilesState;
                });
            })
            .catch((error) => {
                console.error('Error converting files to base64:', error);
                toast.error('Error converting files to base64');
            });

        //setTempAcceptedFiles([])
        setTreatementPhotoModal(false);
    };

    console.log(
        'new temp Files',
        selectedFiles,
        tempSelectedFiles,
        uploadedFiles,
        removeFileNames(uploadedFiles)
    );

    const handleCloseTreatmentPhoto = () => {
        // Compare the selected files with the temporary selected files
        const filesToRemove = selectedFiles.filter(
            (selectedFile) =>
                !tempSelectedFiles.find(
                    (tempFile) => tempFile.treatmentId === selectedFile.treatmentId
                )
        );
        // Remove the files from the selected files
        const updatedSelectedFiles = selectedFiles.map((selectedFile) => {
            const filesToRemoveForTreatment = filesToRemove.find(
                (file) => file.treatmentId === selectedFile.treatmentId
            );
            if (filesToRemoveForTreatment) {
                return {
                    ...selectedFile,
                    treatmentPhoto: selectedFile.treatmentPhoto.filter(
                        (file) => file !== undefined
                    ),
                };
            }
            return selectedFile;
        });

        const updatedTempSelectedFiles = tempSelectedFiles.map((selectedFile) => {
            const filesToRemoveForTreatment = filesToRemove.find(
                (file) => file.treatmentId === selectedFile.treatmentId
            );
            if (filesToRemoveForTreatment) {
                return {
                    ...selectedFile,
                    treatmentPhoto: selectedFile.treatmentPhoto.filter(
                        (file) => file !== undefined
                    ),
                };
            }
            return selectedFile;
        });

        // Remove the files from the uploaded files state
        const updatedUploadedFiles = uploadedFiles.map((file) => {
            const filesToRemoveForTreatment = filesToRemove.find(
                (removeFile) => removeFile.treatmentId === file.treatmentId
            );
            if (filesToRemoveForTreatment) {
                return {
                    ...file,
                    imagesBase64: file.imagesBase64.filter(
                        (img) => !filesToRemoveForTreatment.treatmentPhoto.includes(img.name)
                    ),
                };
            }
            return file;
        });
        console.log('remove temporary files', updatedSelectedFiles);
        // Update the selected files state and close the modal
        setTempSelectedFiles(updatedSelectedFiles);
        setSelectedFiles(updatedSelectedFiles);
        setUploadedFiles(updatedUploadedFiles);
        //setTempAcceptedFiles([])
        setTreatementPhotoModal(false);
    };

    const BackToHome = () => {
        window.location.href = frontendURL + '/business-dashboard';
    };

    const handlePayOnTheDayBooking = () => {
        // setStep(4);
        initiateCompleteForwardConsentFormPaymentBooking(
            {
                bookingId: parseInt(bookingId),
                // paymentId: paymentIntent.id,
                // paymentType: 2,
                cfrToken: searchParams?.get('token'),
                selectedPayment: 'PAY_ON_THE_DAY',
            },
            (res) => {
                if (res.success) {
                    // initiateSaveForwardConsentForm(
                    //     {
                    //         cfrId: parseInt(bookingId),
                    //         token: searchParams?.get('token'),
                    //         notes: note,
                    //     },
                    //     (re) => { },
                    //     (err) => { }
                    // );
                    setStep(4);
                } else {
                    setStep(3);
                }
            },
            (e) => {
                setStep(3);
            }
        );
    };

    const handleCloseClientDetailModal = () => {
        setOpenClientDetailsModal(false);
        setDobError(false);
        setValidationErrors({});
    };
    //============== USE EFFECT DEFINE HERE =====================
    // SET STEP ACCORDING STEPS
    useEffect(() => {
        if (isClientDone && !isConsentFormDone && !isConsentFormPaymentDone) {
            setStep(2);
        }
        if (isConsentFormDone && !isConsentFormPaymentDone) {
            setStep(3);
        }
        if (isConsentFormDone && isConsentFormPaymentDone) {
            setStep(4);
        }
        window.scrollTo(0, 0);
    }, [isClientDone, isConsentFormDone, isConsentFormPaymentDone]);

    useEffect(() => {
        if (isConsentFormDone || isConsentFormPaymentDone || isClientDone) {
            if (isClientDone && !isConsentFormDone && !isConsentFormPaymentDone) {
                setProgressbarStatus(50);
            } else if (isConsentFormDone && !isConsentFormPaymentDone) {
                setProgressbarStatus(100);
            } else if (isConsentFormDone && isConsentFormPaymentDone) {
                setProgressbarStatus(100);
            }
        } else {
            setProgressbarStatus(0);
        }
    }, [isConsentFormDone, isConsentFormPaymentDone, isClientDone]);

    const fetchForwardedConsentFormOverview = () => {
        initForwardConsentFormOverview(
            {
                bookingId: parseInt(bookingId), //19620
                token: searchParams.get('token'), //$2y$10$sTgBbmzVEOqpIEuvM4IzMuXThLywWUvKhfg9rblZKmaClD/NPn0tm
            },
            (res) => {

                if (res.success) {
                    // toast.error(res.message)
                    setUploadedFiles([]);
                }
            },
            (err) => {
                console.log('error', err);
            }
        );
    }

    useEffect(() => {

        if (step == 2 && !walkInConsentQACalled) {
            //CONSENT FORM QUESTION
            initWalkInConsentQA({
                cfrId: parseInt(bookingId),
                cfrToken: searchParams.get("token")
            }, () => {}, () => {});
        }

        // dispatch({
        //     type:CLEAR_FORWARD_CONSENT_FORM_BOOKING_OVERVIEW
        // })
        // dispatch(getPaylaterStatus({
        //     "user_id" : parseInt(appointmentDetails?.appointmentId)
        //   }))

        //CLIENT OVERVIEW API CALL
        if (step == 1 && !forwardConsentFormOverviewCalled) {
            fetchForwardedConsentFormOverview();
        }

        //AVALIBLE PAYMENT METHODS
        // initPaymentMethodAvailable({
        //     cfrId: parseInt(bookingId), //19620
        //     token: searchParams.get("token") //$2y$10$sTgBbmzVEOqpIEuvM4IzMuXThLywWUvKhfg9rblZKmaClD/NPn0tm
        // }, (res) => {
        //     console.log("payment method available", res)
        //     if (res?.success) {
        //         const paymentData = res?.data?.payment_data[0]
        //         setPaymentOptions({
        //             payInFull: paymentData.pay_in_full,
        //             payDeposit: paymentData.pay_deposit,
        //             payOnTheDay: paymentData.pay_on_the_day,
        //             payMonthly: paymentData.pay_monthly
        //         });

        //         if(paymentData?.is_finance_available){
        //             setPaymentOptions({
        //                 payInFull:false,
        //                 payDeposit: false,
        //                 payOnTheDay: false,
        //                 payMonthly: true,
        //             })
        //         }
        //         if(paymentData?.is_ryft_setup){
        //             setPaymentOptions({
        //                 payInFull:true,
        //                 payDeposit: false,
        //                 payOnTheDay: true,
        //                 payMonthly: true,
        //             })
        //         }
        //     }
        // }, (err) => {

        // })

        if (step == 2 && (!forwardConsentFormOverviewCalled)) {
            dispatch({
                type: CLEAR_FORWARD_CONSENT_FORM_BOOKING_OVERVIEW,
            });
            fetchForwardedConsentFormOverview();
        }

        if (step === 4 && !reviewAdded) {
            setTimeout(() => {
                setReviewModal(true);
            }, 2000);
        }

        if (step == 3 && (!forwardConsentFormOverviewCalled || !isConsentFormDone)) {
            fetchForwardedConsentFormOverview();
        }

        window.scrollTo(0, 0);
    }, [step]);

    useEffect(() => {
        console.log("client details updated");
        // if (clientDetailsData && step == 1) {
        setClientDetails({
            ...clientDetails,
            clientName: clientDetailsData?.clientName,
            email: clientDetailsData?.clientEmail,
            birthDay: clientDetailsData?.clientDob,
            phoneNumber: clientDetailsData?.clientPhone,
            phoneCountry: clientDetailsData?.phoneCountry,
            readablePhone: clientDetailsData?.readablePhone,
            address: clientDetailsData?.readableAddress,
        });
        setDobValue(clientDetailsData?.clientDob);
        // }

        setLocation({
            ...location,
            postcode: clientDetailsData?.clientPostcode,
            address2: clientDetailsData?.clientStreetName,
            address1: clientDetailsData?.clientHouseNo,
            city: clientDetailsData?.clientCity,
        });
        setClientIdFile(
            clientDetailsData?.clientIdImage !== '' ? clientDetailsData?.clientIdImage : null
        );
        setCountryCode(clientDetailsData?.countryCode?.toUpperCase());
        setSearchLocation(clientDetailsData?.readableAddress);
    }, [clientDetailsData
        // , step
    ]);

    console.log('location', searchLocation);

    useEffect(() => {
        if (questionsList?.length > 0) {
            const selectedOptions = questionsList.map((question, index) => {
                let answerText = '';
                if (question?.answer == 1) {
                    answerText = 'Yes';
                }
                else if (question?.answer == 0) {
                    answerText = 'No';
                }
                return {
                    // id: index,
                    // identifier: question?.identifier,
                    answerNew: question?.answer,
                    answer: answerText,
                    comment: question?.comment,
                    question: question?.content,
                };
            });
            // console.log("selectedOptions",selectedOptions);
            setSelectedOptions(selectedOptions);
            setSelectedAnswers(selectedOptions);
        }
    }, [questionsList]);
    console.log("selectedPaymentOption",selectedPaymentOption)
    //PAYEMENT SUMMARY SHOW WITH OPTIONS
    useEffect(() => {
        if (selectedPaymentOption === null) {
            setTotalAmount(paymentSummary?.totalAppointmentAmount);
            setTotalDeposit(paymentSummary?.depositAmount);
            setTotalDue(paymentSummary?.dueAmount);
            setTotalDiscount(paymentSummary?.discountAmount);
            setTotalPayble(paymentSummary?.payableAmount);
        }
        if (selectedPaymentOption == 'Pay in full') {
            //setIsNextEnable(true)
            setTotalAmount(paymentSummary?.totalAppointmentAmount);
            setTotalDeposit(0);
            setTotalDue(0);
            setTotalDiscount(paymentSummary?.discountAmount);
            setTotalPayble(paymentSummary?.totalAppointmentAmount);
        }
        if (selectedPaymentOption == 'Pay Deposit') {
            // setIsNextEnable(true)
            setTotalAmount(paymentSummary?.totalAppointmentAmount);
            setTotalDeposit(paymentSummary?.depositAmount);
            setTotalDue(paymentSummary?.dueAmount);
            setTotalDiscount(paymentSummary?.discountAmount);
            setTotalPayble(paymentSummary?.payableAmount);
        }
        if (selectedPaymentOption == 'Pay on the Day') {
            //setIsNextEnable(true)
            setTotalAmount(paymentSummary?.totalAppointmentAmount);
            setTotalDeposit(0);
            setTotalDiscount(paymentSummary?.discountAmount);
            setTotalDue(paymentSummary?.totalAppointmentAmount);
            setTotalPayble(0);
        }
        if (selectedPaymentOption == 'Pay Monthly') {
            //setIsNextEnable(true)
            setIsPayMonthButton(true);
            setTotalAmount(paymentSummary?.totalAppointmentAmount);
            setTotalDeposit(0);
            setTotalDue(0);
            setTotalDiscount(paymentSummary?.discountAmount);
            setTotalPayble(paymentSummary?.totalAppointmentAmount);
        }
    }, [selectedPaymentOption, paymentSummary]);

    //FOR SCROLL TO TOP
    useEffect(() => {
        // if (step == 3) {
        if (step == 3 && isConsentFormDone) {
            let isBypass = selectedPaymentOptionData?.paymentByPass;
            // window.scrollTo(0, 0);
            if (selectedPaymentOption == 'Pay Monthly') {
                if (paymentStatusData[0].is_finance_available) {
                    initiatePayLaterRequest(
                        {
                            bookingId: parseInt(bookingId),
                            redirectUrl: `${frontendURL}/forward-consent-form`,
                            typeData: 'FORWARD_CONSENT_FORM',
                            cfrToken: searchParams?.get('token'),
                        },
                        (res) => {
                            console.log('payLater', res);
                            if (res.success) {
                                setOpenPayLater(res?.success);
                                dispatch(setPaylaterData(res?.data));
                                setPayLaterData(res?.data);
                            } else {
                                setOpenPayLater(res?.success);
                                setPayLaterData(null);
                            }
                        },
                        (e) => {
                            setOpenPayLater(false);
                            // setLoader(false)
                            toast.error(e.message);
                        }
                    );
                }
            } else if (
                paymentStatusData[0]?.is_ryft_setup &&
                !isBypass &&
                (selectedPaymentOption === 'Pay in full' || selectedPaymentOption === 'Pay Deposit' || selectedPaymentOption === 'Pay on the Day')
            ) {
                initRyftTokenForwardConsentFormToken(
                    {
                        cfrId: parseInt(bookingId),
                        cfrToken: searchParams?.get('token'),
                        saveRyftCardFlag: true,
                        paymentType: 1,
                        selectedPayment:
                            selectedPaymentOption === 'Pay Deposit'
                                ? 'PAY_DEPOSIT'
                                : selectedPaymentOption === 'Pay in full'
                                    ? 'PAY_In_FULL'
                                    : selectedPaymentOption === 'Pay on the Day'
                                        ? 'PAY_ON_THE_DAY'
                                        : null,
                        //redirectURL: `${frontendURL}/bookings/${slug}/success`
                    },
                    (res) => {
                        setRftResponseSuccess(
                            res?.data?.getRyftPaymentTokenForwardConsentForm?.success
                        );
                        console.log('stripe res', res);
                    }
                );
            }
            //  else if (paymentStatusData[0]?.is_stripe_setup && !isBypass &&  selectedPaymentOption === "Pay in full") {
            //     initClientSecretSetupIntent({
            //         cfrId: parseInt(bookingId),
            //         cfrToken: searchParams?.get("token")
            //     })

            // }
            else if (
                paymentStatusData[0]?.is_stripe_setup &&
                !isBypass &&
                (selectedPaymentOption === 'Pay in full' || selectedPaymentOption === 'Pay Deposit')
            ) {
                initRyftTokenForwardConsentFormToken(
                    {
                        cfrId: parseInt(bookingId),
                        cfrToken: searchParams?.get('token'),
                        paymentType: 2,
                        selectedPayment:
                            selectedPaymentOption === 'Pay Deposit'
                                ? 'PAY_DEPOSIT'
                                : selectedPaymentOption === 'Pay in full'
                                    ? 'PAY_In_FULL'
                                    : null,
                        //redirectURL: `${frontendURL}/bookings/${slug}/success`
                    },
                    (res) => {
                        setRftResponseSuccess(
                            res?.data?.getRyftPaymentTokenForwardConsentForm?.success
                        );
                        console.log('stripe res', res?.data?.getRyftPaymentTokenForwardConsentForm);
                    }
                );
            }
        }
        if (paymentStatusData && !selectedPaymentOption) {
            // console.log("payment option selection value ", paymentStatusData[0]);
            if (paymentStatusData[0]?.pay_in_full) {
                // console.log("payment option selection pay in full");
                setSelectedPaymentOption("Pay in full")
            }
            else if (paymentStatusData[0]?.pay_deposit && paymentSummary?.depositAmount !== 0) {
                // console.log("payment option selection pay deposit");
                setSelectedPaymentOption("Pay Deposit")
            }
            else if (paymentStatusData[0]?.pay_monthly && paymentStatusData[0].is_finance_available) {
                // console.log("payment option selection pay monthly");
                setSelectedPaymentOption("Pay Monthly")
            }
            else if (paymentStatusData[0]?.pay_on_the_day) {
                setSelectedPaymentOption("Pay on the Day")
            }
            else {
                setSelectedPaymentOption(null)
            }
        }
    }, [step, paymentStatusData, selectedPaymentOption, isConsentFormDone]);

    useLayoutEffect(() => {
        if (selectedPaymentOption == 'Pay on the Day') {
            PayontheDayhRef?.current?.scrollIntoView({
                behavior: 'smooth'
            })
        }
    }, [selectedPaymentOption])

    const openOverview = () => {
        setShow(true);
    };
    useEffect(() => {
        if (show) {
            document.body.classList.add('overviewSideBar-open');
        } else {
            document.body.classList.remove('overviewSideBar-open');
        }
    }, [show]);

    //GET TREATMENT IDS
    useEffect(() => {
        if (treatmentDetails?.length > 0 && !isIdentityCalled) {
            const newData = [];
            //   setTreatmentIds(treatmentDetails?.map(item=> item.treatmentId))
            treatmentDetails?.map((item) => {
                let treatmentPhotos = item?.beforePhotos, treatmentPhotosList = [];
                if (!treatmentPhotos || !treatmentPhotos?.length) {
                    treatmentPhotos = [];
                }
                treatmentPhotosList = [...(treatmentPhotos)];
                if (treatmentPhotos?.length < 6) {
                    treatmentPhotosList = [...treatmentPhotosList, ...Array(6 - treatmentPhotos?.length).map(() => [])];
                }
                newData?.push({
                    treatmentId: item?.treatmentId,
                    treatmentPhoto:
                        treatmentPhotosList,
                });
            });
            setTempSelectedFiles(newData);
            setSelectedFiles(newData);
        }
    }, [treatmentDetails]);

    useEffect(() => {
        if (selectedFiles) {
            setSelectedImageData(
                selectedFiles
                    .map((item) => {
                        return item.treatmentPhoto.filter((val) => val != undefined);
                    })
                    .flat()
            );
        }
    }, [selectedFiles]);

    useEffect(() => {
        console.log("forwardConsentFormOverviewCalled notes", notes);
        if (forwardConsentFormOverviewCalled) {
            setNote(notes);
        }
    }, [notes]);

    useEffect(() => {
        if (forwardConsentFormOverviewCalled && clientSignature) {
            setPreviewDataURL(null);
            setSignedSignatureData(clientSignature);
            setTrimmedDataURL(null);
        }
    }, [clientSignature]);

    const handleSignture = () => {
        setIsSignatureOpen(false);
        setIsSigned(false);
        console.log('tempTrimmedDataURL akash');
        if (sigPadRef?.current?.isEmpty() === false) {
            setTrimmedDataURL(null);
        } else {
            setTrimmedDataURL(tempTrimmedDataURL);
        }
    };
    const clear = () => {
        console.log('clear signature', sigPadRef?.current?.isEmpty());
        sigPadRef?.current?.clear();
        // setTempTrimmedDataURL(trimmedDataURL);
        setTrimmedDataURL(null);
        setPreviewDataURL('');
        setSignedSignatureData(null);

        setIsSigned(true);
        setToggleSigned(true);
        setIsSignatureOpen(true);
        setTempTrimmedDataURL(null)
    };

    const handleSignatureModalClose = () => {
        setIsSignatureOpen(false); // Close the SignatureModal
        // setIsOpen(true); // Close the NewAppointment
        // setIsSigned(false)
        // setToggleSigned(true)
        console.log('sigPadRef?.current?.isEmpty()', isSigned, trimmedDataURL);

        if (bookingId !== undefined) {
            setIsSigned(false);
            setToggleSigned(true);
            // setTrimmedDataURL(sigPadRef?.current?.toDataURL("image/png"))
        } else {
            if (trimmedDataURL !== null) {
                setTrimmedDataURL(sigPadRef?.current?.toDataURL('image/png'));
                setIsSigned(false);
            } else {
                setToggleSigned(false);
                setIsSigned(true);
            }
        }
    };

    const handleHide = () => {
        console.log('trimmedDataURL from hide', trimmedDataURL);
        //setIsOpen(false);
        setPreviewDataURL(signedSignatureData);

        if (bookingId !== undefined) {
            console.log('from booking id signature', sigPadRef?.current);
            // setTrimmedDataURL(appointmentDetails?.signature)
            setIsSigned(false);
            setToggleSigned(true);
        } else {
            // if(trimmedDataURL !== null){
            //   setTrimmedDataURL(sigPadRef?.current?.toDataURL("image/png"))
            //   setIsSigned(false)
            // }else{
            //   setToggleSigned(false)
            //   setIsSigned(true)
            // }
        }
        setIsSignatureOpen(true);
    };

    const backClickHandler = () => {
        if (step == 2) {
            setStep(1);
            setIsPopUpTrue(true)
            setIsManuallyModal(false);

        } else if (step == 3) {
            if (!isPayMonthButton) {
                setIsPayMonthButton(true);
            }
            else {
                setStep(2);
            }

        }
    };

    const PayontheDayhRef = useRef(null);
    const PayinfullhRef = useRef(null);
    const PayDepositRef = useRef(null);
    const PayMonthly = useRef(null);


    return (
        <div className='MainCustomeConsentForm'>

            {appointmentDetails == undefined ? (
                <>
                    {
                        <div className="invalid-link-consent">
                            <h1>
                                It seems that the link is invalid, please use the link that you have
                                received in your email!
                            </h1>
                        </div>
                    }
                </>
            ) : (
                <div className="custom-forword-page">
                    {/* HEADER */}
                    {/* <BusinessHeader /> */}
                    {step != 4 && (
                        <NavHeader
                            btnLabel={'Save'}
                            applyPadding={false}
                            isBackWithCloseAndProgressBar={true}
                            handleOnBack={() => {
                                backClickHandler();
                            }}
                            isBorder={true}
                            isBackInvisible={step == 1 ? true : false}
                            progressbarStatus={progressbarStatus}
                        />
                    )}

                    {step === 4 ? (
                        <div className="container">
                            {/* <div className='success-thankyou-consent-form'>
                                    <div className='success-thankyou-content'> */}
                            {/* <h1>Thank you</h1>
                                        <h2>Your Consent Form Has Been Submitted Successfully</h2>
                                        <h2>Thank you for taking the time to fill out the consent form for your treatment. Your consent is essential to ensure that we can provide you with the best possible care and meet your needs effectively.</h2>
                                        <h2>Our team will review your consent form and ensure that all necessary arrangements are made for your treatment.</h2>
                                        <div className='button-section'>
                                            <StepButton blue={true} onClick={() => {
                                                setIsDeleteModal(false);
                                                navigate(businessDashboardRoutePattern)
                                            }} label={"Back to Home"} />
                                        </div> */}
                            <div className="main-forward-thankyou">
                                {/* <div className='TopHeader'>
        <div className='header-thankyou'>
          <img src={backIcon} alt='backIcon' onClick={() => setCurrentStep(4)} />
        </div>
      </div> */}

                                <div className="main-forward-thakyou-body ConsentThankyou">
                                    <div className="main-forward-body">
                                        <div className="congration-wrapper-forward-thankyou">
                                            <Lottie
                                                options={defaultOptions}
                                                width={'388px'}
                                                height={'100%'}
                                            />
                                        </div>
                                        <div className="thankyou-forward-body">
                                            <div>
                                                <img src={thankyou} alt="thankyou" />
                                            </div>
                                            <div className="header-text-forward-thankyou">
                                                Thank you
                                            </div>

                                            <div className="context-forward-thankyou">
                                                <h2>Your booking is confirmed !</h2>
                                                {/* {appointmentDetails?.clinicName && appointmentDetails?.appointmentTime && appointmentDetails?.appointmentDate && <h2>Appointment {appointmentDetails?.clinicName != null ? (<>with <span>{appointmentDetails.clinicName}</span></>) : ""} is confirmed at {appointmentDetails?.appointmentTime} on the {moment(appointmentDetails?.appointmentDate, 'Do MMM, YYYY').format('Do [of] MMMM YYYY')}</h2>} */}

                                                {appointmentDetails?.clinicName &&
                                                    appointmentDetails?.appointmentTime != 'N/A' &&
                                                    appointmentDetails?.appointmentDate != 'N/A' ? (
                                                    <h2>
                                                        You have an appointment with {fullName} at{' '}
                                                        {''}
                                                        {appointmentDetails?.clinicName} on the {''}
                                                        {
                                                            appointmentDetails?.appointmentDate
                                                        } at {appointmentDetails?.appointmentTime}
                                                    </h2>
                                                ) : appointmentDetails?.clinicName ? (
                                                    <h2>
                                                        Appointment with{' '}
                                                        {appointmentDetails?.clinicName} is
                                                        confirmed{' '}
                                                    </h2>
                                                ) : appointmentDetails?.appointmentDate != 'N/A' &&
                                                    appointmentDetails?.appointmentTime != 'N/A' ? (
                                                    <h2>
                                                        Appointment is confirmed at{' '}
                                                        {appointmentDetails?.appointmentTime} on the{' '}
                                                        {moment(
                                                            appointmentDetails?.appointmentDate,
                                                            'Do MMM, YYYY'
                                                        ).format('Do [of] MMMM YYYY')}
                                                    </h2>
                                                ) : null}
                                                {/* ld-flag */}
                                                {paymentSummary?.dueAmount !== 0 &&
                                                    (selectedPaymentOption !== "Pay on the Day") ? (
                                                    // <h2>
                                                    //     You have a balance of £
                                                    //     {paymentSummary?.dueAmount?.toFixed(2)} on
                                                    //     the day of the appointment
                                                    // </h2>
                                                    selectedPaymentOption == "Pay in full" ?
                                                        <h2>
                                                            You have paid £
                                                            {paymentSummary?.totalAppointmentAmount?.toFixed(2)}{''}
                                                        </h2> :
                                                        <h2>
                                                            You have paid £
                                                            {paymentSummary?.depositAmount?.toFixed(2)}{' '}
                                                            and have a remaining balance of £
                                                            {paymentSummary?.dueAmount?.toFixed(2)} to
                                                            pay on the day
                                                        </h2>
                                                ) : (selectedPaymentOptionData?.payOnTheDay && selectedPaymentOption === "Pay on the Day") ? (
                                                    // <h2>
                                                    //     You have a balance of £
                                                    //     {paymentSummary?.totalAppointmentAmount?.toFixed(2)} on
                                                    //     the day of the appointment
                                                    // </h2>
                                                    <h2>
                                                        You have a remaining balance of £
                                                        {paymentSummary?.totalAppointmentAmount?.toFixed(2)} to
                                                        pay on the day
                                                    </h2>
                                                ) : null}
                                            </div>

                                            <div className="col-12 mt-0 mt-md-4 mt-lg4 text-center">
                                                <div
                                                    className="btn back-forward-thank-you"
                                                    onClick={() => {
                                                        BackToHome();
                                                    }}
                                                >
                                                    Home
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* </div> */}
                            <ClientSideReviewModal
                                setReviewModal={setReviewModal}
                                reviewModal={reviewModal}
                                clinicName={
                                    appointmentDetails?.clinicName
                                        ? appointmentDetails?.clinicName
                                        : appointmentDetails?.businessName
                                }
                                consentFormId={parseInt(bookingId)}
                            />
                            {/* </div> */}
                        </div>
                    ) : (
                        <>
                            <div className="container-fluid forward-question-main-container px-0">
                                <div className="mx-0 cus-for-consent">
                                    <div
                                        className="cus-for-consent-left custome-forconsent-Main CustomeForwardConsentPadding Custome540Width"
                                        style={!isPayMonthButton ? { maxWidth: 'unset' } : {}}
                                    >
                                        <div className="Custome-consent-form">
                                            <div className="view-overview-wrap d-block d-md-none">
                                                <button
                                                    className="view-overview-btn"
                                                    onClick={() => {
                                                        openOverview();
                                                    }}
                                                >
                                                    View Overview
                                                </button>
                                            </div>
                                            {/* {forwardConsentFormOverviewLoading ? (
                                                <div
                                                    className="notification-header p-0"
                                                    style={{ lineHeight: 0 }}
                                                >
                                                    <Skeleton width={'100%'} height={94} />
                                                </div>
                                            ) : (
                                                <div
                                                    className={`${
                                                        step == 2 ? 'notification-header' : ''
                                                    }`}
                                                >
                                                    {step === 2 ? (
                                                        <p>
                                                            Consent form for your appointment{' '}
                                                            {appointmentDetails?.clinicName !=
                                                            null ? (
                                                                <>
                                                                    {appointmentDetails?.clinicName &&
                                                                        'with'}{' '}
                                                                    <span>
                                                                        {
                                                                            appointmentDetails.clinicName
                                                                        }
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                ''
                                                            )}{' '}
                                                            {appointmentDetails?.appointmentDate !=
                                                            'N/A' ? (
                                                                <>
                                                                    {' '}
                                                                    on{' '}
                                                                    <span>
                                                                        {moment(
                                                                            appointmentDetails?.appointmentDate,
                                                                            'Do MMM, YYYY'
                                                                        ).format('DD-MM-YYYY')}
                                                                    </span>{' '}
                                                                    at{' '}
                                                                    <span>
                                                                        {moment(
                                                                            appointmentDetails?.appointmentTime,
                                                                            'h:mm A'
                                                                        ).format('HH:mm')}
                                                                    </span>
                                                                    .
                                                                </>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </p>
                                                    ) : // selectedPaymentOptionData?.payOnTheDay ?
                                                    // <p>You wont be charged now, payment will be collected in store after your appointment</p>
                                                    // :
                                                    null}
                                                </div>
                                            )} */}
                                            {step == 1 && (
                                                <>
                                                    {forwardConsentFormOverviewLoading ? (
                                                        <SkeletonLoader type="consent-form-client-details" />
                                                    ) : (
                                                        <EditClientDetails
                                                            setClientDetails={setClientDetails}
                                                            setOpenClientDetailsModal={
                                                                setOpenClientDetailsModal
                                                            }
                                                            clientDetails={clientDetails}
                                                            setSearchLocation={setSearchLocation}
                                                            setPrevSearchLocation={setPrevSearchLocation}
                                                            prevSearchLocation={prevSearchLocation}

                                                            searchLocation={searchLocation}
                                                            setLocation={setLocation}
                                                            isDone={isDone}
                                                            setIsDone={setIsDone}
                                                            location={location}
                                                            setSelectedLocation={
                                                                setSelectedLocation
                                                            }
                                                            selectedLocation={selectedLocation}
                                                            validationErrors={validationErrors}
                                                            setValidationErrors={
                                                                setValidationErrors
                                                            }
                                                            setDobError={setDobError}
                                                            dobError={dobError}
                                                            validateInput={validateInput}
                                                            handleUpdate={handleContinue}
                                                            setDobValue={setDobValue}
                                                            dobValue={dobValue}
                                                            setYear={setYear}
                                                            setDay={setDay}
                                                            setMonth={setMonth}
                                                            day={day}
                                                            year={year}
                                                            month={month}
                                                            setCountryCode={setCountryCode}
                                                            countryCode={countryCode}
                                                            isLoading={
                                                                updateClientDetailsForwardConsentFormData?.loading
                                                            }
                                                            clientSubmitInitiated={clientSubmitInitiated}
                                                            isManuallyModal={isManuallyModal}
                                                            setIsManuallyModal={setIsManuallyModal}
                                                            submitClientDetails={submitClientDetails}
                                                            submitClientAfterAddress={submitClientAfterAddress}
                                                            isSearchNewUpdate={isSearchNewUpdate}
                                                            setIsSearchNewUpdate={setIsSearchNewUpdate}
                                                        />
                                                    )}
                                                </>
                                            )}
                                            {step === 2 && (
                                                <>
                                                    {/* <NavHeader btnLabel={"Save"}  applyPadding={false} isBackWithCloseAndProgressBar={true} handleOnBack={() => {}} onClickCallback={() => {}} isBorder={true}/> */}
                                                    {/* DISCLAIMER */}
                                                    <div className="CustomeCompleteConsentForm Custome540Width">
                                                        <div className="disclaimer-box">
                                                            {walkInConsentQALoading ? (
                                                                <>
                                                                    <Skeleton
                                                                        width={100}
                                                                        height={10}
                                                                    />
                                                                    <Skeleton
                                                                        width={'100%'}
                                                                        height={5}
                                                                    />
                                                                    <Skeleton
                                                                        width={400}
                                                                        height={10}
                                                                    />
                                                                    <Skeleton
                                                                        width={200}
                                                                        height={10}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <div className="secConsTitle">
                                                                    <h1 className="consent-form-heading">
                                                                        {/* Consent Form{' '}
                                                                    {treatmentDetails?.length >
                                                                    0 ? (
                                                                        <>
                                                                            for{' '}
                                                                            {treatmentDetails
                                                                                ?.map(
                                                                                    (item) =>
                                                                                        item.treatmentName
                                                                                )
                                                                                .join(' , ')}
                                                                        </>
                                                                    ) : (
                                                                        ''
                                                                    )} */}
                                                                        Complete consent form
                                                                    </h1>
                                                                    {/* <hr /> */}
                                                                    <p>
                                                                        {/* Please read the attached
                                                                    disclaimers. If you have any
                                                                    questions or concerns, consult
                                                                    with the service provider. */}
                                                                        Please read the disclaimer and answer all questions accurately.
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <div className="disclaimer-wrap">
                                                                <div
                                                                    className="accordion"
                                                                    id="accordionExample"
                                                                >
                                                                    {walkInConsentQALoading ? (
                                                                        <SkeletonLoader type="forward-consent-disclaimer" />
                                                                    ) : (
                                                                        disclaimersList?.map(
                                                                            (disclaimer, i) => (
                                                                                <div
                                                                                    className="accordion-item"
                                                                                    key={i}
                                                                                    // style={{border:"none"}}
                                                                                    id="accordion-remove-border"
                                                                                >
                                                                                    <h2
                                                                                        className="accordion-header"
                                                                                        id={`heading${i}`}
                                                                                    >
                                                                                        <button
                                                                                            className="accordion-button collapsed"
                                                                                            type="button"
                                                                                            data-bs-toggle="collapse"
                                                                                            data-bs-target={`#collapse${i}`}
                                                                                            aria-expanded="false"
                                                                                            aria-controls={`collapse${i}`}
                                                                                        >
                                                                                            {
                                                                                                disclaimer?.consentFormName
                                                                                            }{' '}
                                                                                            Disclaimer
                                                                                        </button>
                                                                                    </h2>
                                                                                    <div
                                                                                        id={`collapse${i}`}
                                                                                        className="accordion-collapse collapse"
                                                                                        aria-labelledby={`heading${i}`}
                                                                                        data-bs-parent="#accordionExample"
                                                                                    >
                                                                                        <div className="accordion-body">
                                                                                            <p>
                                                                                                {
                                                                                                    disclaimer?.consent_form_name
                                                                                                }
                                                                                            </p>
                                                                                            {
                                                                                                disclaimer?.disclaimer
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        )
                                                                    )}
                                                                    {/* <div class="accordion-item">
                                                                        <h2 class="accordion-header" id="headingTwo">
                                                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                                                                demo to check flow Disclaimer
                                                                            </button>
                                                                        </h2>
                                                                        <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                                                            <div class="accordion-body">
                                                                                This is the second item's accordion body. It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the .accordion-body, though the transition does limit overflow.
                                                                            </div>
                                                                        </div>
                                                                    </div> */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {questionsList?.length === 0 &&
                                                            walkInConsentQALoading && (
                                                                <Skeleton width={100} height={50} />
                                                            )}
                                                        {/* QUESTION SECTION */}
                                                        <div className="ConsentQuestion">
                                                            {questionsList?.length === 0 &&
                                                                walkInConsentQALoading ? (
                                                                <SkeletonLoader
                                                                    type={
                                                                        'forward-consent-question'
                                                                    }
                                                                />
                                                            ) : (
                                                                questionsList?.map(
                                                                    (question, index) => {
                                                                        return (
                                                                            <QuestionsList
                                                                                key={question?.questionId}
                                                                                onChange={(
                                                                                    option,
                                                                                    comment,
                                                                                    que
                                                                                ) =>
                                                                                    handleOptionChange(
                                                                                        index,
                                                                                        option,
                                                                                        comment,
                                                                                        que
                                                                                    )
                                                                                }
                                                                                selectedOption={
                                                                                    selectedOptions[
                                                                                    index
                                                                                    ]
                                                                                }
                                                                                label={
                                                                                    question?.content
                                                                                }
                                                                                id={index}
                                                                            />
                                                                        );
                                                                    }
                                                                )
                                                            )}
                                                        </div>
                                                        {/* client identity document tile */}
                                                        <div
                                                            className="tile-list-container mt-5"
                                                            onClick={() => {
                                                                handleClientId();
                                                            }}
                                                        >
                                                            <div className="left-client-content">
                                                                {/* {
                        <IdentityIcon/>
                      } */}
                                                                <div className="compliance-img-container6">
                                                                    <img
                                                                        className="main-img"
                                                                        src={IdentityIcon}
                                                                        alt=""
                                                                    />
                                                                    {addIdentityForwardConsentFormData?.loading ? (
                                                                        <img
                                                                            style={{
                                                                                borderRadius: '50%',
                                                                            }}
                                                                            className="time-icon"
                                                                            width={20}
                                                                            src={loaderIcon}
                                                                            alt="identity"
                                                                        />
                                                                    ) : (
                                                                        <img
                                                                            className="time-icon"
                                                                            src={
                                                                                clientIdFile
                                                                                    ? timeIcon2
                                                                                    : timeIcon1
                                                                            }
                                                                            alt="identity"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="identity-text-wrapper">
                                                                    <h1>Identity <small>(optional)</small></h1>
                                                                    <p>
                                                                        ID, driving license or
                                                                        passport
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="right-client-content">
                                                                <RightArrow />
                                                            </div>
                                                        </div>

                                                        {/* track progress container */}
                                                        <div className="track-progress-container">
                                                            <div className="progressTitleWrapper">
                                                                <h1>Upload your before photos</h1>
                                                                <p>
                                                                    See your improvements by
                                                                    uploading your before photos.
                                                                </p>
                                                            </div>
                                                            <div className="selectedImgGrid">
                                                                {selectedImageData?.length > 0 &&
                                                                    selectedImageData.map(
                                                                        (item, i) => {
                                                                            return (
                                                                                <div className="selected-image">
                                                                                    <img
                                                                                        src={

                                                                                            typeof item == 'object' && item.photoUrl ?
                                                                                                item.photoUrl
                                                                                                : URL.createObjectURL(
                                                                                                    item
                                                                                                )
                                                                                        }
                                                                                    />
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                            </div>
                                                            <div className="track-progress-upload-btn">
                                                                <StepButton
                                                                    gray={true}
                                                                    label={
                                                                        selectedImageData?.length > 0
                                                                            ? `${selectedImageData?.length} ${selectedImageData?.length > 1 ? "photos" : "photo"} added`
                                                                            : 'Upload photos'
                                                                    }
                                                                    isLeftIcon={true}
                                                                    leftIcon={<Photo />}
                                                                    onClick={() => {
                                                                        setIsTreatmentModalOpen(
                                                                            true
                                                                        );
                                                                    }}
                                                                />
                                                            </div>
                                                            {/* MARKETING CHECKBOX */}
                                                            <div className="marketing-checkbox-container">
                                                                <div
                                                                    className="marketing-checkbox cursor-pointer"
                                                                    onClick={handleAdvertisement}
                                                                >
                                                                    <CustomCheckbox
                                                                        checked={isAdvertisement}
                                                                        id={'advertisement1'}
                                                                        name={'advertisement'}
                                                                    />
                                                                    <p>
                                                                        I consent to my treatment
                                                                        photos being used for
                                                                        marketing.
                                                                    </p>
                                                                    {/* <div className={`input-checkbox`} name={"name"}>
                                    <input type="checkbox"
                                        id={"marketing-checkbox"}
                                        name={"marketing-checkbox"}
                                        checked={true}
                                    />
                                </div>
                                <p>I consent to my treatment photos being used for marketing.</p> */}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="consent-note-section">
                                                            <h1>Note</h1>
                                                            <TextInput
                                                                multiline
                                                                placeholder="Add a note for the clinic"
                                                                value={note}
                                                                onChange={(e) =>
                                                                    setNote(e.target.value)
                                                                }
                                                                autoresize
                                                            />
                                                        </div>

                                                        {/* SIGNATURE SECTION */}
                                                        {/* <div className='consent-client-sign mb-4'>
                                                            <div className='heading-section-signature'>
                                                                <p>Client signature</p>
                                                                {trimmedDataURL && <i className="fa fa-eraser" aria-hidden="true" onClick={() => { signRef?.current?.clear(); setTrimmedDataURL(null) }} ></i>}
                                                            </div>
                                                            <div className='signature-pad'>
                                                                <SignatureCanvas
                                                                    ref={signRef}
                                                                    clearOnResize={false}
                                                                    throttle={null}
                                                                    penColor='black'
                                                                    canvasProps={{
                                                                     
                                                                        className: "signature-pad-canvas"
                                                                    }}
                                                                    onEnd={() => {
                                                                        setTrimmedDataURL(signRef?.current?.getTrimmedCanvas().toDataURL("image/png"))
                                                                    }}

                                                                />
                                                            </div>
                                                        </div> */}
                                                        <div className="client-signature-wrapper my-4">
                                                            <label className="form-label">
                                                                Client signature
                                                            </label>
                                                            <div className="right-section" ref={signatureRef}>
                                                                {signedSignatureData && (
                                                                    <div
                                                                        className="cursor-pointer eraserImg "
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            console.log('stopprop');
                                                                            clear();
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={EraseImg}
                                                                            alt="EraseImg"
                                                                            width={48}
                                                                            height={48}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div
                                                                    className="card-section cursor-pointer signatureCard"
                                                                    onClick={() => handleHide()}
                                                                >
                                                                    <div className="edit-section "></div>
                                                                    <div className="d-flex flex-column align-items-center gap-2 sign-section ">
                                                                        {forwardConsentFormOverviewLoading ? (
                                                                            <Skeleton
                                                                                width={200}
                                                                                height={128}
                                                                            />
                                                                        ) : signedSignatureData ===
                                                                            null ? (
                                                                            <div className="emptySignSec">
                                                                                <EmptySignIcon />
                                                                                <h1>
                                                                                    Your signature
                                                                                </h1>
                                                                            </div>
                                                                        ) : (
                                                                            <img
                                                                                src={
                                                                                    signedSignatureData
                                                                                }
                                                                                alt="signature"
                                                                                className="signature"
                                                                            />
                                                                        )}
                                                                        {/* {
                   signedSignatureData && signedSignatureData === null ? <h1>Your signature</h1> : ""
                   }  */}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* TREATMENT SECTION */}

                                                        {/* { treatmentDetails?.length > 0 &&  <div className='consent-treatment-section' >
                                                                <p>Upload current photo before treatment</p>
                                                                <hr />
                                                                {
                                                            treatmentDetails?.map((treatment,i) => {
                                                                const selectedTreatment = tempSelectedFiles.find(item => item.treatmentId === treatment?.treatmentId);
                                                                const selectedFilesForTreatment = selectedTreatment ? selectedTreatment.treatmentPhoto || [] : [];
                                                        
                                                                // Find the first file with content
                                                                const firstFile = selectedFilesForTreatment.find(file => file !== undefined);
                                                                return(
                                                                <div className="treatment-photo-modal mt-4 cursor-pointer" key={i} onClick={() => handleTreatmentPhotoModal(treatment)}>
                                                                    <div className='d-flex align-items-center'>
                                                                        <div className='treatment-preview-one-photo'>
                                                                        {
                                                                            firstFile ? (
                                                                                <img src={URL.createObjectURL(firstFile)} />
                                                                            ):
                                                                            (
                                                                                <img src={treatmentPhotoModalIcon} alt="Icon" />
                                                                            )
                                                                        }
                                                                        </div>
                                                                        <div className='treatment-modal-detail'>
                                                                            <h4>{treatment?.treatmentName}</h4>
                                                                            <p>{(selectedFiles.find(item => item.treatmentId === treatment?.treatmentId)?.treatmentPhoto || []).filter(file => file !== undefined).length} Before photos added</p>
                                                                        </div>
                                                                    </div>
                                                                    <span>
                                                                        <i className="fa-solid fa-chevron-right"></i>
                                                                    </span>
                                                                </div>
                                                                
                                                                )
                                                        }) 
                                                        }
                                                        </div>} */}

                                                        {
                                                            <CustomModal
                                                                modalOpen={treatmentPhotoModal}
                                                                setModalOpen={
                                                                    handleCloseTreatmentPhoto
                                                                }
                                                                modaltitle={
                                                                    treatmentData?.treatmentName
                                                                }
                                                                className={
                                                                    'treatment-modal-cus-pad customeTreatment-Model'
                                                                }
                                                                modalBody={
                                                                    <div className="treatment-before-modal">
                                                                        <hr />
                                                                        <p>Before Photos</p>
                                                                        <div className="pic-upload-container">
                                                                            <div className="pic-upload-wrap">
                                                                                {tempSelectedFiles?.map(
                                                                                    (treat, i) =>
                                                                                        treat?.treatmentPhoto?.map(
                                                                                            (
                                                                                                file,
                                                                                                index
                                                                                            ) =>
                                                                                                treat?.treatmentId ===
                                                                                                treatmentData?.treatmentId && (
                                                                                                    <div
                                                                                                        key={`${treat?.treatmentId}-${index}`}
                                                                                                        className="pic-upload-box"
                                                                                                    >
                                                                                                        {file !==
                                                                                                            undefined && (
                                                                                                                <div className="cross-icon">
                                                                                                                    <img
                                                                                                                        src={
                                                                                                                            CloseIcon
                                                                                                                        }
                                                                                                                        alt=""
                                                                                                                        onClick={() =>
                                                                                                                            handleDelete(
                                                                                                                                treat?.treatmentId,
                                                                                                                                index,
                                                                                                                                file,
                                                                                                                            )
                                                                                                                        }
                                                                                                                    />
                                                                                                                </div>
                                                                                                            )}
                                                                                                        {file ===
                                                                                                            undefined && (
                                                                                                                <Dropzone
                                                                                                                    onDrop={(
                                                                                                                        files
                                                                                                                    ) =>
                                                                                                                        handleFileUpload(
                                                                                                                            files,
                                                                                                                            treatmentData?.treatmentId,
                                                                                                                            index
                                                                                                                        )
                                                                                                                    }
                                                                                                                    maxFiles={
                                                                                                                        1
                                                                                                                    }
                                                                                                                    accept="image/*"
                                                                                                                >
                                                                                                                    {({
                                                                                                                        getRootProps,
                                                                                                                        getInputProps,
                                                                                                                        isDragActive,
                                                                                                                        acceptedFiles,
                                                                                                                    }) => (
                                                                                                                        <div
                                                                                                                            {...getRootProps()}
                                                                                                                        >
                                                                                                                            <input
                                                                                                                                {...getInputProps()}
                                                                                                                            />
                                                                                                                            <label
                                                                                                                                htmlFor={`beforePhotosUnique-0`}
                                                                                                                            >
                                                                                                                                <img
                                                                                                                                    src={
                                                                                                                                        beforePhotoMiniIcon
                                                                                                                                    }
                                                                                                                                />
                                                                                                                            </label>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                </Dropzone>
                                                                                                            )}
                                                                                                        {file !==
                                                                                                            undefined && (
                                                                                                                <label
                                                                                                                    htmlFor={`beforePhotosUnique-0`}
                                                                                                                >
                                                                                                                    <img
                                                                                                                        style={{
                                                                                                                            width: '100%',
                                                                                                                            height: '200px',
                                                                                                                            borderRadius:
                                                                                                                                '20px',
                                                                                                                        }}
                                                                                                                        src={typeof file == 'object' && file.photoUrl ?
                                                                                                                            file.photoUrl
                                                                                                                            : URL.createObjectURL(
                                                                                                                                file
                                                                                                                            )}
                                                                                                                    />
                                                                                                                </label>
                                                                                                            )}
                                                                                                    </div>
                                                                                                )
                                                                                        )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="treatment-modal-btn">
                                                                            <button
                                                                                className="before-photo-save-btn"
                                                                                onClick={
                                                                                    handleSaveTreatmentPhoto
                                                                                }
                                                                            >
                                                                                Save
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                }
                                                            />
                                                        }

                                                        {/* {console.log(
                                                            'uploaded files',
                                                            uploadedFiles,
                                                            removeFileNames(uploadedFiles)
                                                        )} */}
                                                        {/* {treatmentDetails?.map(treatment => (
                                                        <div className='consent-treatment-section'>
                                                            <p>Upload current photo before {treatment?.treatmentName}</p>
                                                            <hr />
                                                            <div className='treatment-parent-section'>
                                                                <div className='treatment-image-section'>
                                                                    <div key={treatment?.treatmentId}>
                                                                        <Dropzone
                                                                            onDrop={files => handleFileUpload(files, treatment?.treatmentId)}
                                                                            maxFiles={6}
                                                                            accept="image/*"
                                                                        >
                                                                            {({ getRootProps, getInputProps, isDragActive }) => (
                                                                                <div {...getRootProps()} className={`formDropzoneUploading ${isDragActive ? 'formDropzoneUploading-active' : ''}`}>
                                                                                    <input {...getInputProps()} />
                                                                                    <div className='add-more-label-container'>
                                                                                        <img src={fileUploadImage} alt='' />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Dropzone>
                                                                        {uploadedFiles.map(({ treatmentId, imagesBase64 }, index) => {
                                                                            if (treatmentId === treatment?.treatmentId) {

                                                                                return (
                                                                                    <div className='treatment-preview-section' key={treatmentId}>

                                                                                        {imagesBase64 && imagesBase64?.map((base64Image, fileIndex) => {
                                                                                            const fileName = uploadedFiles.find(file => file.treatmentId === treatmentId)?.imagesBase64[fileIndex]?.name || '';
                                                                                            const fileExtension = fileName.split('.').pop()
                                                                                            const maxLength = 20; // Maximum length of the truncated file name

                                                                                            let truncatedName = fileName;
                                                                                            if (fileName.length > maxLength) {
                                                                                                const truncatedWithoutExtension = fileName.substring(0, maxLength - fileExtension.length - 4); // Adjusting for the length of '...'
                                                                                                truncatedName = truncatedWithoutExtension + '...' + fileExtension; // Combine truncated name and extension
                                                                                            }
                                                                                            return (
                                                                                                <div className='preview-main-section' key={fileIndex}>
                                                                                                    <div className='left-consent-section'>
                                                                                                        <img src={base64Image?.base64} alt={`Uploaded file ${fileIndex}`} onClick={() => handlePreview(base64Image?.base64)} />
                                                                                                        <p>{truncatedName}</p>
                                                                                                    </div>
                                                                                                    <div className='right-consent-section'>
                                                                                                        <PreviewIcon onClick={() => handlePreview(base64Image?.base64)} />
                                                                                                        <DeleteIcon onClick={() => handleDelete(treatmentId, fileIndex)} />
                                                                                                    </div>
                                                                                                </div>
                                                                                            );
                                                                                        })}

                                                                                    </div>
                                                                                );
                                                                            }
                                                                            return null;
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))} */}

                                                        {/* LEGS TREATMENT SECTION */}
                                                        {/* <div className='consent-treatment-section'>
                            <p>Legs Treatment</p>
                            <div className='treatment-parent-section'>
                                <div className='treatment-image-section'>
                                {
                                        <Dropzone onDrop={handleFileUpload} >
                                        
                                        {({ getRootProps, getInputProps }) => (
                                                <div {...getRootProps()} className='formDropzoneUploading' >
                                                    <input {...getInputProps()} />
                                                    <div className='add-more-label-container'>
                                                        <img src={fileUploadImage} alt='' />
                                                        <p>Add more</p>
                                                    </div>
                                                </div>
                                            )}
                                        
                                        </Dropzone>
                                    }
                                    {
                                        uploadedFiles.map((file, index) => (
                                        <div className='treatment-preview-section'>
                                            <img key={index} src={URL.createObjectURL(file)} alt={`Uploaded file ${index}`} />
                                            </div>
                                        ))
                                    }
                                
                                </div>
                            </div>
                        </div> */}
                                                    </div>
                                                </>
                                            )}
                                            {/* FINAL PAYMENT SECTION AND STEP 2 */}
                                            {step === 3 && (
                                                <>
                                                    <div className={!isPayMonthButton ? "CustomePaymentCons CustomePayMonthly" : "CustomePaymentCons"}>
                                                        {forwardConsentFormOverviewLoading ? (
                                                            <SkeletonLoader
                                                                type={'forward-payment-options'}
                                                            />
                                                        ) : (
                                                            <div
                                                                className={
                                                                    !isPayMonthButton
                                                                        ? 'd-none'
                                                                        : 'consent-form-payment-option'
                                                                }
                                                            >
                                                                <div className='FirstDetails'>
                                                                    <div class="secConsTitle">
                                                                        <h1 class="consent-form-heading">Confirm and pay</h1>
                                                                        <p>Please confirm how you would like to pay</p>
                                                                    </div>

                                                                    <div className='companyBox'>
                                                                        <div className='companyBoxContent'>
                                                                            <div className='RatingWrapper'><span> <StarIcon /> </span> <span>{averageRating} ({userTotalReviews})</span> </div>
                                                                            <h5>{appointmentDetails?.businessName}</h5>
                                                                            <p>With {userFirstName}</p>
                                                                        </div>
                                                                        <div className='companyBoxProfile'>
                                                                            {/* <img src={userProfile} alt={fullName} /> */}
                                                                            <Avatar
                                                                                src={userProfile}
                                                                                name={
                                                                                    userFirstName?.at(0) + " " + userLastName?.at(0)
                                                                                }
                                                                                color="#EEEFF3"
                                                                                fgColor="#000"
                                                                                round
                                                                                size="60"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className='PaymentSummaryCard'>
                                                                        <div className='TagAppoiment'>
                                                                            <p>Payment summary</p>
                                                                        </div>

                                                                        <div className='PaymentSummaryContentGrid'>
                                                                            {
                                                                                treatmentDetails?.map((item) => {
                                                                                    return (
                                                                                        <div className='PaymentSummaryContentItem'>
                                                                                            <p>{item?.treatmentName}</p>
                                                                                            <h5>£{item?.treatmentPrice}</h5>
                                                                                        </div>
                                                                                    )
                                                                                })
                                                                            }
                                                                            {/* <div className='PaymentSummaryContentItem'>
                                                                            <p>Service name 1</p>
                                                                            <h5>£100.00</h5>
                                                                        </div>
                                                                        <div className='PaymentSummaryContentItem'>
                                                                            <p>Service name 2</p>
                                                                            <h5>£100.00</h5>
                                                                        </div> */}
                                                                            {/* <div className='PaymentSummaryContentItem'>
                                                                            <p>Platform fees</p>
                                                                            <h5>£10,000.00</h5>
                                                                        </div> */}
                                                                            {
                                                                                paymentSummary?.discountAmount ?
                                                                                    <div className='PaymentSummaryContentItem'>
                                                                                        <p>Discount</p>
                                                                                        <h5>£{paymentSummary?.discountAmount}</h5>
                                                                                    </div> : null
                                                                            }
                                                                            <div className='PaymentSummaryContentItem'>
                                                                                <p className='BoldText'>Total</p>
                                                                                <h5 className='BoldText'>£{paymentSummary?.totalAppointmentAmount}</h5>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {!selectedPaymentOptionData?.paymentByPass && (
                                                                    <p>Choose payment method</p>
                                                                )}
                                                                {!selectedPaymentOptionData?.paymentByPass && (
                                                                    <hr />
                                                                )}
                                                                <div className='paymentOptionWrapper'>
                                                                    <div
                                                                        className="payment-option-section"
                                                                        style={{
                                                                            display:
                                                                                paymentStatusData[0]
                                                                                    ?.pay_in_full
                                                                                    ? 'flex'
                                                                                    : 'none',
                                                                        }}
                                                                    >
                                                                        <div className="right-payment-option-section ">
                                                                            <PayFullIcon />
                                                                            <CustomRadioButton
                                                                                text={'Pay in full'}
                                                                                id={'Pay in full'}
                                                                                value="Pay in full"
                                                                                name="payment"
                                                                                preselect
                                                                                isblacked={true}
                                                                                text2={`Pay the full £${getTotalPriceAfterDiscount(
                                                                                    0
                                                                                )} now.`}
                                                                                onChange={() => {
                                                                                    handlePaymentOptionChange(
                                                                                        'Pay in full'
                                                                                    )

                                                                                    // setTimeout(() => {
                                                                                    //     window.scrollTo({
                                                                                    //         top: PayinfullhRef?.current?.offsetTop,
                                                                                    //         behavior: "smooth"
                                                                                    //     })
                                                                                    // }, 1000);
                                                                                }

                                                                                }
                                                                                checked={
                                                                                    selectedPaymentOption ===
                                                                                    'Pay in full'
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        className="payment-option-section"
                                                                        style={{
                                                                            display:
                                                                                paymentStatusData[0]
                                                                                    ?.pay_deposit &&
                                                                                    paymentSummary?.depositAmount !==
                                                                                    0
                                                                                    ? 'block'
                                                                                    : 'none',
                                                                        }}
                                                                    >
                                                                        <div className="right-payment-option-section ">
                                                                            <PayDepositIcon />
                                                                            <CustomRadioButton
                                                                                text={'Pay deposit'}
                                                                                id={'Pay Deposit'}
                                                                                value={'Pay deposit'}
                                                                                name="payment"
                                                                                preselect
                                                                                isblacked={true}
                                                                                text2={`£${paymentSummary?.depositAmount >
                                                                                    getTotalPriceAfterDiscount(
                                                                                        2
                                                                                    )
                                                                                    ? '0.00'
                                                                                    : `${paymentSummary?.depositAmount
                                                                                    } now, £${(getTotalPriceAfterDiscount(
                                                                                        2
                                                                                    ) -
                                                                                        paymentSummary?.depositAmount?.toFixed(
                                                                                            2
                                                                                        )).toFixed(2)
                                                                                    } on the day.`
                                                                                    }`}
                                                                                onChange={() => {
                                                                                    handlePaymentOptionChange(
                                                                                        'Pay Deposit'
                                                                                    )
                                                                                    // setTimeout(() => {
                                                                                    //     window.scrollTo({
                                                                                    //         top: PayDepositRef?.current?.offsetTop,
                                                                                    //         behavior: "smooth"
                                                                                    //     })
                                                                                    // }, 1000);
                                                                                }
                                                                                }
                                                                                checked={
                                                                                    selectedPaymentOption ===
                                                                                    'Pay Deposit'
                                                                                }

                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        className="payment-option-section"
                                                                        style={{
                                                                            display:
                                                                                paymentStatusData[0]
                                                                                    ?.pay_monthly
                                                                                    ? 'flex'
                                                                                    : 'none',
                                                                        }}
                                                                    >
                                                                        <div className="right-payment-option-section ">
                                                                            <PayDayIcon />
                                                                            <CustomRadioButton
                                                                                text={'Pay monthly'}
                                                                                id={'Pay_Monthly'}
                                                                                value={'Pay monthly'}
                                                                                name="payment"
                                                                                preselect
                                                                                isblacked={true}
                                                                                text2={`Pay £${(
                                                                                    paymentSummary?.totalAppointmentAmount /
                                                                                    3
                                                                                ).toFixed(
                                                                                    2
                                                                                )} / pm with Payl8r.`}
                                                                                onChange={() => {
                                                                                    handlePaymentOptionChange(
                                                                                        'Pay Monthly'
                                                                                    )

                                                                                    // setTimeout(() => {
                                                                                    //     window.scrollTo({
                                                                                    //         top: PayMonthly?.current?.offsetTop,
                                                                                    //         behavior: "smooth"
                                                                                    //     })
                                                                                    // }, 100);
                                                                                }

                                                                                }
                                                                                checked={
                                                                                    selectedPaymentOption ===
                                                                                    'Pay Monthly'
                                                                                }

                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        className="payment-option-section"
                                                                        style={{
                                                                            display:
                                                                                paymentStatusData[0]
                                                                                    ?.pay_on_the_day
                                                                                    ? 'block'
                                                                                    : 'none',
                                                                        }}
                                                                    >
                                                                        <div className="right-payment-option-section ">
                                                                            <PayDayIcon />
                                                                            <CustomRadioButton
                                                                                text={'Pay on the day'}
                                                                                id={'Pay_on_the_Day'}
                                                                                value={'Pay on the day'}
                                                                                className={"modelCTAinBoxChecked"}
                                                                                name="payment"
                                                                                preselect
                                                                                isblacked={true}
                                                                                text2={`Pay the full amount in the venue`}
                                                                                onChange={() => {

                                                                                    handlePaymentOptionChange(
                                                                                        'Pay on the Day'
                                                                                    )

                                                                                    setTimeout(() => {
                                                                                        // window.scrollTo({
                                                                                        //     top: PayontheDayhRef?.current?.offsetTop,
                                                                                        //     behavior: "smooth"
                                                                                        // })
                                                                                    }, 100);

                                                                                    // PayontheDayhRef?.current?.scrollIntoView({
                                                                                    //     behavior: 'smooth'
                                                                                    // })
                                                                                }

                                                                                }
                                                                                checked={
                                                                                    selectedPaymentOption ===
                                                                                    'Pay on the Day'
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectedPaymentOption ==
                                                            'Pay Monthly' ? (
                                                            isPayMonthButton ? (
                                                                <>
                                                                    {/* <div className='btnWrapper' ref={PayMonthly}>
                                                                        <StepButton
                                                                            blue={true}
                                                                            label={'PAY NOW'}
                                                                            disabled={!openPayLater}
                                                                            onClick={() =>
                                                                                setIsPayMonthButton(false)
                                                                            }
                                                                        />
                                                                    </div> */}
                                                                </>
                                                            ) : (
                                                                <div className='PayLaterWrapper'>
                                                                    <PayLater
                                                                        payLaterData={payLaterData}
                                                                        bookingId={parseInt(bookingId)}
                                                                        setOpenPayLater={true}
                                                                    />
                                                                </div>
                                                            )
                                                        ) : ryftResponseSuccess == true ? (
                                                            paymentStatusData[0]?.is_ryft_setup && bookingId != null && forwardConsentBookingAccountId != null &&
                                                                (selectedPaymentOption == 'Pay Deposit' || selectedPaymentOption === 'Pay in full' || selectedPaymentOption === 'Pay on the Day') ? (
                                                                getRyftTokenForwardConsentFormQueryData?.loading ? (
                                                                    <SkeletonLoader type="forward-consent-payment" />
                                                                ) : (

                                                                    !selectedPaymentOptionData?.paymentByPass && (
                                                                        <div ref={
                                                                            selectedPaymentOption == 'Pay Deposit' ? PayDepositRef : PayinfullhRef
                                                                        }>
                                                                            <RyftComponent
                                                                                clientSecret={sessionToken}
                                                                                accountId={
                                                                                    forwardConsentBookingAccountId
                                                                                }
                                                                                bookingId={parseInt(
                                                                                    bookingId
                                                                                )}
                                                                                ryftDataObj={
                                                                                    // paymentSummary?.depositAmount !== 0 ?
                                                                                    // {

                                                                                    //     treatmentPrice: `£${paymentSummary?.totalAppointmentAmount?.toFixed(2)}`,
                                                                                    //     totalDeposit: `£${paymentSummary?.depositAmount.toFixed(2)}`,
                                                                                    //     totalDue: `£${paymentSummary?.dueAmount?.toFixed(2)}`,
                                                                                    //     cfrToken: searchParams?.get('token'),
                                                                                    // }
                                                                                    // :
                                                                                    // {

                                                                                    //         treatmentPrice: `£${paymentSummary?.totalAppointmentAmount?.toFixed(2)}`,
                                                                                    //         payableAmount: `£${paymentSummary?.payableAmount}`,
                                                                                    //         totalDue: `£${paymentSummary?.dueAmount?.toFixed(2)}`,
                                                                                    //         cfrToken: searchParams?.get('token'),
                                                                                    // }
                                                                                    selectedPaymentOption ==
                                                                                        'Pay in full'
                                                                                        ? {

                                                                                            payableAmount: `£${paymentSummary?.totalAppointmentAmount?.toFixed(2)}`,
                                                                                            bookingfees: `£${((paymentSummary?.totalAppointmentAmount / 100) * (paymentSummary.commissionPercentage)).toFixed(2)}`, // Calculate booking fees as 2% of totalAppointmentAmount
                                                                                            grandTotal: `£${(parseFloat(paymentSummary?.totalAppointmentAmount) + (paymentSummary?.totalAppointmentAmount / 100) * (paymentSummary?.commissionPercentage)).toFixed(2)}`
                                                                                        }
                                                                                        : {
                                                                                            payableAmount: `£${paymentSummary?.depositAmount?.toFixed(2)}`,
                                                                                            bookingfees: `£${(paymentSummary?.depositAmount / 100) * (paymentSummary?.commissionPercentage).toFixed(2)}`,
                                                                                            grandTotal: `£${(parseFloat(paymentSummary?.depositAmount) + (paymentSummary?.depositAmount / 100) * (paymentSummary?.commissionPercentage)).toFixed(2)}`

                                                                                        }
                                                                                }
                                                                                setStep={setStep}
                                                                                noShowPolicy={true}
                                                                                note={note}
                                                                                isForwardConsentFormPayment={
                                                                                    true
                                                                                }
                                                                                selectedOption={
                                                                                    selectedPaymentOption
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )
                                                                )
                                                            ) :
                                                                paymentStatusData[0]?.is_stripe_setup && bookingId != null && forwardConsentBookingAccountId != null &&
                                                                    (selectedPaymentOption == 'Pay Deposit' || selectedPaymentOption === 'Pay in full') ?
                                                                    (getRyftTokenForwardConsentFormQueryData.loading ? (
                                                                        <SkeletonLoader type="forward-consent-payment" />
                                                                    ) : (
                                                                        !selectedPaymentOptionData?.paymentByPass && (
                                                                            <StripeComponent
                                                                                clientSecret={
                                                                                    sessionToken != null
                                                                                        ? sessionToken
                                                                                        : null
                                                                                }
                                                                                paymentType="card"
                                                                                bookingId={parseInt(
                                                                                    bookingId
                                                                                )}
                                                                                isConsentFrom={true}

                                                                                stripeDataObj={

                                                                                    selectedPaymentOption ==
                                                                                        'Pay in full'
                                                                                        ? {

                                                                                            payableAmount: `£${paymentSummary?.totalAppointmentAmount?.toFixed(2)}`,
                                                                                            // bookingfees: `£${((paymentSummary?.totalAppointmentAmount / 100) * (paymentSummary.commissionPercentage)).toFixed(2)}`, // Calculate booking fees as 2% of totalAppointmentAmount
                                                                                            // grandTotal: `£${(parseFloat(paymentSummary?.totalAppointmentAmount) + (paymentSummary?.totalAppointmentAmount / 100) * (paymentSummary?.commissionPercentage)).toFixed(2)}`
                                                                                        }
                                                                                        : {
                                                                                            payableAmount: `£${paymentSummary?.depositAmount?.toFixed(2)}`,
                                                                                            // bookingfees: `£${(paymentSummary?.totalAppointmentAmount / 100) * (paymentSummary?.commissionPercentage).toFixed(2)}`,
                                                                                            // grandTotal: `£${(parseFloat(paymentSummary?.depositAmount) + (paymentSummary?.totalAppointmentAmount / 100) * (paymentSummary?.commissionPercentage)).toFixed(2)}`

                                                                                        }

                                                                                    // paymentSummary?.dueAmount == 0 ?
                                                                                    // {

                                                                                    //     treatmentPrice: `£${paymentSummary?.totalAppointmentAmount?.toFixed(2)}`,
                                                                                    //     totalDue: `£${paymentSummary?.dueAmount?.toFixed(2)}`,
                                                                                    //     cfrToken: searchParams?.get('token'),
                                                                                    // }
                                                                                    // :
                                                                                    // {

                                                                                    //     treatmentPrice: `£${paymentSummary?.totalAppointmentAmount?.toFixed(2)}`,
                                                                                    //     totalDeposit: `£${paymentSummary?.depositAmount.toFixed(2)}`,
                                                                                    //     totalDue: `£${paymentSummary?.dueAmount?.toFixed(2)}`,
                                                                                    //     cfrToken: searchParams?.get('token'),
                                                                                    // }
                                                                                    // {payableAmount: `£${paymentSummary?.depositAmount == 0 ? paymentSummary?.totalAppointmentAmount?.toFixed(2) : paymentSummary?.dueAmount?.toFixed(2)}`}
                                                                                }
                                                                                noShowPolicy={true}
                                                                                setStep={setStep}
                                                                                note={note}
                                                                                selectedOption={
                                                                                    selectedPaymentOption
                                                                                }
                                                                            />
                                                                        )
                                                                    )) : null
                                                        ) : null}

                                                        {
                                                            (selectedPaymentOption ==
                                                                'Pay Monthly' && isPayMonthButton) || (!paymentStatusData[0]?.is_ryft_setup && selectedPaymentOption == 'Pay on the Day') || (forwardConsentFormOverviewLoading) || (
                                                                    getRyftTokenForwardConsentFormQueryData?.loading
                                                                ) ?
                                                                <div className='btnWrapper test-loader'>
                                                                    <StepButton
                                                                        label={
                                                                            selectedPaymentOption == 'Pay on the Day' ? 'Confirm booking' :
                                                                                'PAY NOW'
                                                                        }
                                                                        blue={true}
                                                                        disabled={selectedPaymentOption == 'Pay Monthly' ? !openPayLater :
                                                                            (paymentStatusData[0]?.is_ryft_setup && selectedPaymentOption == 'Pay on the Day') ? true :
                                                                                false}
                                                                        onClick={
                                                                            () => {
                                                                                if (!paymentStatusData[0]?.is_ryft_setup && selectedPaymentOption == 'Pay on the Day') {
                                                                                    handlePayOnTheDayBooking();
                                                                                }
                                                                                if (selectedPaymentOption == 'Pay Monthly') {
                                                                                    setIsPayMonthButton(false)
                                                                                }
                                                                            }
                                                                        }
                                                                        isLoading={
                                                                            selectedPaymentOption == 'Pay on the Day' ? completeForwardConsentFormPaymentBookingMutationData?.loading :
                                                                                false
                                                                        }
                                                                    />
                                                                </div>
                                                                : null
                                                        }
                                                    </div>
                                                    {/* PAYMENT SUMMARY*/}

                                                    {selectedPaymentOption == 'Pay on the day' && (
                                                        <div className="no-show-policy-section mt-4">
                                                            <h1>No show and cancellation policy</h1>
                                                            <p>
                                                                Card details are securely stored. No
                                                                upfront charge is made. Details
                                                                could be billed depending on the
                                                                businesses no show policy.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* NOTE SECTION */}
                                                    {/* {selectedPaymentOption != 'Pay Monthly' && (
                                                        <div className="consent-note-section">
                                                            <h1>Note</h1>
                                                            <textarea
                                                                placeholder="Add a note for the clinic"
                                                                value={note}
                                                                onChange={(e) =>
                                                                    setNote(e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                    )} */}

                                                    {/* BYPASS OPTIONS BUTTON */}
                                                    {/* {selectedPaymentOptionData?.paymentByPass && <StepButton blue={true} isLoading={completeForwardConsentFormPaymentBookingMutationData?.loading} label={"Continue Booking"} onClick={handleByPassPayment} />} */}
                                                </>
                                            )}
                                            {/* BUTTON SECTION */}
                                            {step === 2 && (
                                                <div className="btnWrapper">
                                                    <StepButton
                                                        label={'Next'}
                                                        blue={true}
                                                        isLoading={
                                                            saveForwardConsentFormData?.loading
                                                        }
                                                        onClick={handleNext}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* <div className={show ? "fullHeight-ForwardConsent-Form custome-Right-overView cus-for-consent-right overviewTrue" : "fullHeight-ForwardConsent-Form cus-for-consent-right custome-Right-overView"}>
                                            <div className='d-block d-md-none overview-close-icon'>
                                                <button className='overview-close-btn' onClick={() => { setShow(false) }}>
                                                    <i class="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                            {
                                                  <input
                                                  type="file"
                                                  ref={clientIdRef}
                                                  style={{ display: 'none' }}
                                                  onChange={handleFileClientIdChange}
                                              />
                                            }
                                            {
                                                forwardConsentFormOverviewLoading  ?
                                                    <SkeletonLoader type="forward-consent-review" />
                                                    :
                                                    <ConsentOverView handleEdit={handleEdit} clientDetails={clientDetails} clientReducer={clientDetailsData} paymentSummary={paymentSummary} clinicDetails={appointmentDetails} treatmentDetails={treatmentDetails} totalAmount={totalAmount} totalDiscount={totalDiscount} totalDue={totalDue} totalDeposit={totalDeposit} totalPayble={totalPayble} step={step} handleClientId={handleClientId} setClientIdFile={setClientIdFile} clientIdFile={clientIdFile} handleFileClientIdChange={handleFileClientIdChange} loading={addIdentityForwardConsentFormData?.loading}/>
                                            }
                                            {
                                                console.log("client Details first step",clientDetails)
                                            }
                                        </div> */}
                                    <input
                                        type="file"
                                        ref={clientIdRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileClientIdChange}
                                    />
                                </div>
                            </div>

                            {/* DELETE MODAL */}
                            {
                                <CustomModal
                                    modalOpen={isDeleteModal}
                                    setModalOpen={setIsDeleteModal}
                                    className={'ConfirmationDeleteModal'}
                                    modaltitle={'Are you sure?'}
                                    portalClassName={`ConfirmationDeleteModalPortal`}
                                    modalBody={
                                        <div className="delete-confirm-modal-section">
                                            <p className="mb-5">
                                                Are you sure you want to delete?
                                            </p>
                                            <div className="button-section">
                                                <StepButton
                                                    red={true}
                                                    isLoading={
                                                        fileToDeleteIndex == null
                                                            ? deleteIdentityForwardConsentFormData?.loading
                                                            : removeBeforeAfterPhotoLoading
                                                    }
                                                    label={'Delete'}
                                                    onClick={() => {
                                                        handleConfirmDelete();
                                                    }}
                                                />
                                                <StepButton
                                                    gray={true}
                                                    onClick={() => {
                                                        setIsDeleteModal(false);
                                                    }}
                                                    label={'Cancel'}
                                                />
                                            </div>
                                        </div>
                                    }
                                />
                            }

                            {/* PREVIEW TREATMENT IMAGE MODAL */}
                            {
                                <CustomModal
                                    modalOpen={treatmentPreviewModal}
                                    setModalOpen={setTreatmentPreviewModal}
                                    modalBody={
                                        <div className="treatment-preview-modal-section">
                                            <img src={previewTreatmentPhoto} alt="" />
                                        </div>
                                    }
                                />
                            }

                            {/* Treatment preview modal */}
                            {
                                <CustomModal
                                    modalOpen={isTreatmentModalOpen}
                                    setModalOpen={setIsTreatmentModalOpen}
                                    className={'CustomeUploadCurrentPhotoModel'}
                                    modalBody={
                                        <>
                                            {/* TREATMENT SECTION */}

                                            {treatmentDetails?.length > 0 && (
                                                <div className="consent-treatment-section">
                                                    <p>Upload current photo before treatment</p>
                                                    <hr />

                                                    <div className="treatmentPhotoModalGrid">
                                                        {treatmentDetails?.map((treatment, i) => {
                                                            const selectedTreatment =
                                                                tempSelectedFiles.find(
                                                                    (item) =>
                                                                        item.treatmentId ===
                                                                        treatment?.treatmentId
                                                                );
                                                            let selectedFilesForTreatment =
                                                                selectedTreatment
                                                                    ? selectedTreatment.treatmentPhoto ||
                                                                    []
                                                                    : [];
                                                            selectedFilesForTreatment = selectedFilesForTreatment.filter(
                                                                (file) => file !== undefined
                                                            );

                                                            // Find the first file with content
                                                            const firstFile =
                                                                selectedFilesForTreatment.find(
                                                                    (file) => file !== undefined
                                                                );
                                                            return (
                                                                <div
                                                                    className="treatment-photo-modal mt-4 cursor-pointer"
                                                                    key={i}
                                                                    onClick={() =>
                                                                        handleTreatmentPhotoModal(
                                                                            treatment
                                                                        )
                                                                    }
                                                                >
                                                                    <div className="d-flex align-items-center">
                                                                        <div className="treatment-preview-one-photo">
                                                                            {firstFile ? (
                                                                                <img
                                                                                    src={
                                                                                        typeof firstFile == 'object' && firstFile.photoUrl ?
                                                                                            firstFile.photoUrl
                                                                                            : URL.createObjectURL(
                                                                                                firstFile
                                                                                            )}
                                                                                />
                                                                            ) : (
                                                                                <img
                                                                                    src={
                                                                                        treatmentPhotoModalIcon
                                                                                    }
                                                                                    alt="Icon"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div className="treatment-modal-detail">
                                                                            <h4>
                                                                                {
                                                                                    treatment?.treatmentName
                                                                                }
                                                                            </h4>
                                                                            <p>
                                                                                {
                                                                                    // (
                                                                                    //     selectedFiles.find(
                                                                                    //         (
                                                                                    //             item
                                                                                    //         ) =>
                                                                                    //             item.treatmentId ===
                                                                                    //             treatment?.treatmentId
                                                                                    //     )
                                                                                    //         ?.treatmentPhoto ||
                                                                                    //     []
                                                                                    // ).filter(
                                                                                    //     (file) =>
                                                                                    //         file !==
                                                                                    //         undefined
                                                                                    // ).length
                                                                                    selectedFilesForTreatment?.length
                                                                                }{' '}
                                                                                Before {selectedFilesForTreatment && selectedFilesForTreatment?.length > 1 ? "photos" : 'photo'} added
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <span>
                                                                        <i className="fa-solid fa-chevron-right"></i>
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    }
                                />
                            }

                            {/* PREVIEW TREATMENT IMAGE MODAL */}
                            {
                                <CustomModal
                                    modalOpen={treatmentPreviewModal}
                                    setModalOpen={setTreatmentPreviewModal}
                                    modalBody={
                                        <div className="treatment-preview-modal-section">
                                            <img src={previewTreatmentPhoto} alt="" />
                                        </div>
                                    }
                                />
                            }

                            {/* CLIENT ID MODAL */}
                            {console.log('clientId File', clientIdFile)}
                            <CustomModal
                                modalOpen={clientIdModal}
                                setModalOpen={setClientIdModal}
                                modaltitle={'Client ID'}
                                className={'client-id-modal Custome-Img-PreviewModel'}
                                modalBody={
                                    <div className="client-id-wrap">
                                        <hr />
                                        {forwardConsentFormOverviewLoading ? (
                                            <Skeleton
                                                width={'100%'}
                                                height={'300px'}
                                                borderRadius={20}
                                            />
                                        ) : (
                                            <div className="upload-id-doc">
                                                <img
                                                    src={clientIdFile != null && clientIdFile}
                                                    alt=""
                                                />

                                                {/* <input type="file" id="client-id-doc" /> */}
                                            </div>
                                        )}

                                        <StepButton
                                            className="client-id-delete"
                                            red={true}
                                            onClick={handleClientIdDelete}
                                            label={'Delete'}
                                        />
                                    </div>
                                }
                            />

                            {/* For Signature modal */}
                            {isSignatureOpen && (
                                <CustomModal
                                    className={'CustomeSignModel'}
                                    modalOpen={isSignatureOpen}
                                    setIsOpenMobileCalendar={setIsSignatureOpen}
                                    setModalOpen={handleSignture}
                                    type="common-width"
                                    modalBody={
                                        <div className="d-flex flex-column wrapper-canvas">
                                            {!previewDataURL ? (
                                                <SignatureCanvas
                                                    clearOnResize={false}
                                                    ref={sigPadRef}
                                                    canvasProps={{
                                                        width: 500,
                                                        height: 200,
                                                        className: 'signCanvas',
                                                    }}
                                                    penColor="black"
                                                    throttle={null}
                                                    onEnd={() => {
                                                        setIsSigned(false);
                                                        setToggleSigned(true);
                                                        setTrimmedDataURL(
                                                            sigPadRef?.current
                                                                ?.getTrimmedCanvas()
                                                                .toDataURL('image/png')
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={previewDataURL}
                                                    style={{
                                                        objectFit: 'none',
                                                        height: 200,
                                                        width: 500,
                                                    }}
                                                />
                                            )}
                                            <div className="justify-content-between d-flex w-100">
                                                {/* <button style={{position:"absolute",top:0,margin:"10px 0px",border:"none",borderRadius:"100px",padding:"10px"}} onClick={()=>sigPadRef?.current?.clear()}>Clear</button> */}
                                                {
                                                    previewDataURL && (
                                                        <>
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => clear()}
                                                            >
                                                                <img
                                                                    src={EraseImg}
                                                                    alt="EraseImg"
                                                                    width={48}
                                                                    height={48}
                                                                />
                                                            </div>
                                                        </>
                                                    )

                                                    // <div style={{ background: "#EEEFF3", cursor: "pointer", width: "48px", height: "48px", borderRadius: "50%", position: 'relative' }} onClick={clear}>
                                                    //   <i class="fa fa-eraser" aria-hidden="true" style={{ display: "block", marginLeft: "auto", marginRight: "auto", transform: "translate(15px, 15px)" }} ></i>
                                                    // </div>
                                                }
                                                {previewDataURL || trimmedDataURL ? (
                                                    <UndoEnableIcon
                                                        style={
                                                            !previewDataURL
                                                                ? { cursor: 'pointer' }
                                                                : { visibility: 'hidden' }
                                                        }
                                                        onClick={() => clear()}
                                                    />
                                                ) : (
                                                    <UndoIcon
                                                        style={
                                                            !previewDataURL
                                                                ? { cursor: 'not-allowed' }
                                                                : { visibility: 'hidden' }
                                                        }
                                                    />
                                                )}
                                                {
                                                    <EnableCheck
                                                        onClick={() => {
                                                            handleSignatureModalClose();
                                                            setIsSignatureOpen(false);
                                                            setToggleSigned(true);

                                                            if (trimmedDataURL) {
                                                                // setPreviewDataURL(trimmedDataURL);
                                                                console.log(
                                                                    'signature data akash',
                                                                    trimmedDataURL
                                                                );
                                                                setSignedSignatureData(
                                                                    trimmedDataURL
                                                                );
                                                            } else if (previewDataURL) {
                                                                setSignedSignatureData(
                                                                    previewDataURL
                                                                );
                                                            } else {
                                                                setSignedSignatureData(null);
                                                            }
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    //: (
                                                    // <DisableCheck style={{ cursor: "not-allowed" }} />
                                                    // )
                                                }
                                            </div>
                                        </div>
                                    }
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            {
                <SuccessModal
                    isOpen={requestSendModal}
                    setIsOpen={setRequestSendModal}
                    title={''}
                    subTitle={"We've let the practitioner know you are interested in Buy Now Pay Later"}
                    selectPaymentOption={selectedPaymentOption}
                    selectedPaymentOption={selectedPaymentOptionData}
                    setSelectedPaymentOption={setSelectedPaymentOption}
                    paymentStatusData={paymentStatusData}
                />
            }
            {console.log(
                'payment step ',
                isConsentFormDone,
                isConsentFormPaymentDone,
                clientSecret
            )}
            <div
                className={show ? 'showoverLayOverview overLayOverview' : 'overLayOverview'}
                onClick={() => {
                    setShow(false);
                }}
            />
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        fontFamily: 'Inter',
                        fontSize: '14px',
                        background: '#363636',
                        color: '#fff',
                        padding: '18px',
                    },
                }}
            />
        </div>
    );
};

export default ForwardConsentForm;
