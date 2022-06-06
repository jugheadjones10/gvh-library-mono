import { getTokenFromGCPServiceAccount } from '@sagi.io/workers-jwt'

export default async function getRowsFromSheet({limit, offset}){

  let range
  if(limit){
    range = "A2" + ":" + "H" + (1 + limit)
  }
  if(offset){
    range = "A" + (2 + offset) + ":" + "H" 
  }

  //Add in token caching for an hour?
  const token = await getTokenFromGCPServiceAccount({ 
    serviceAccountJSON : JSON.parse(SERVICE_ACCOUNT_JSON), 
    aud: GOOGLE_TOKEN_AUD
  })
  const headers = { Authorization: `Bearer ${token}`}

  const apiEndpoint = "https://sheets.googleapis.com/v4/spreadsheets/" + GOOGLE_SPREADSHEET_ID + "/values/" + GOOGLE_WORKSHEET_TITLE + "!" + range


  const response = await fetch(apiEndpoint, { headers })
  const {values} = await response.json()

  //getRowsFromSheet is guaranteed to return at least a non-null empty array
  let result = []
  if(values){
    var filtered = values.filter(x => x.length > 0)
    result = filtered ? filtered : []
  }

  return result
}
