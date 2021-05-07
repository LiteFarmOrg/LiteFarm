import ModalComponent from "../ModalComponent/v2";
import Button from "../../Form/Button";
import React from "react";
import {Label} from "../../Typography";
import {useTranslation} from "react-i18next";


export default function CropCatalogSpotLightModal () {

    const {t} = useTranslation();

    return (
        <ModalComponent title={'Crop Catalog'} buttonGroup={<><Button sm>Next</Button></>}>
            <>
                <Label style={{paddingBottom:'16px'}}>{t('CROP_CATALOG.HERE_YOU_CAN')}</Label>

                <ul style={{marginLeft: '20px', display:'flex', flexDirection:'column', rowGap:'16px'}}>
                    <li>
                        <Label>{t('CROP_CATALOG.ADD_CROPS_T0_YOUR_FARM')}</Label>

                    </li>
                    <li>
                        <Label>{t('CROP_CATALOG.DOCUMENT_NECESSARY_INFO_FOR_ORGANIC_PRODUCTION')}</Label>
                    </li>
                    <li>
                        <Label>{t('CROP_CATALOG.CREATE_MANAGEMENT_PLANS')}</Label>
                    </li>
                </ul>
            </>
        </ModalComponent>
    )

}