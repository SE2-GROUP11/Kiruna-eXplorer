import dayjs from 'dayjs'

function Document(id, title,stakeholder,scale,issuanceDate,type,language,description){
    this.id = id;
    this.title = title;
    this.stakeholder = stakeholder;
    this.scale = scale;
    this.issuanceDate = dayjs(issuanceDate).format('DD-MM-YYYY');
    this.type=type;
    this.language = language;
    this.description = description;
}

export default Document;