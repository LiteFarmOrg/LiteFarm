import ModalComponent from "../ModalComponent/v2";
import Button from "../../Form/Button";
import React from "react";
import {Label} from "../../Typography";
import {useTranslation} from "react-i18next";


export default function SpotlightComponentModal () {

    const {t} = useTranslation();

    return (
        <ModalComponent title={'Crop Catalog'} buttonGroup={<><Button sm>Next</Button></>}>
            <>
                <Label style={{paddingBottom:'16px'}}>{t('CROP_CATALOG.HERE_YOU_CAN')}</Label>

                <ul style={{marginLeft: '20px', display:'flex', flexDirection:'column', rowGap:'16px'}}>
                    <li>
                        <Label>Add crops to your farm</Label>

                    </li>
                    <li>
                        <Label>Document necessary info for organic production</Label>
                    </li>
                    <li>
                        <Label>Create management plans</Label>
                    </li>
                </ul>
            </>
        </ModalComponent>
    )

}