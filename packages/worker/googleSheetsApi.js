import { getTokenFromGCPServiceAccount } from '@sagi.io/workers-jwt'

export default async function getRowsFromSheet({limit, offset}){

  // try{
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
  let { values } = await response.json()

  // What happens if the Google sheet contains "whitespace"? Will the values variable be an array of length 0 or null?
  // Any empty cells will be returned as an empty string
  if(!values) throw new Error("Google sheet response is null")

  // }catch(e){
  //   console.error(e)
  // }
  return values
}
