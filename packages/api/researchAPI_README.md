# Research API 

### Endpoint
##### Integration
`https://litefarm-api-integration.herokuapp.com/stats/farm`
##### Production
`https://litefarm-api-production.herokuapp.com/stats/farm`

### List of queriy parameters 
All parameters are in boolean except farm_id and token   
Order does not matter
  
  - farm_id `required` `string`
  - token `required` `string`
  - all 
  - users 
  - fields
  - field_crops
  - shifts
  - logs
  - expenses
  - sales
  - people_fed
  - soil_om
  - labour_happiness
  - biodiversity
  - waterbalance
  - nitrogenbalance
  
 ### Examples
 
  - Get users data  
    `https://www.litefarm.org/stats/farm?farm_id=xxxxxxxxxxxxx&token=xxxxxxxxxxxxx&users=true`
  - Get users and labour_happiness  
     `https://www.litefarm.org/stats/farm?farm_id=xxxxxxxxxxxxx&token=xxxxxxxxxxxxx&users=true&labour_happiness=true`
