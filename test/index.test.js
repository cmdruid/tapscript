import tape from 'tape'
import txTest from './tx/tx.test.js'
import APICrawler from './api/api.test.js'

tape('BTON Test Suite', async t => {

  t.test('Vector Tests', t => {
    txTest(t)
  })
  
  // t.test('API Crawler Tests', async t => {
  //   await APICrawler(t)
  // })
})
