import { getDateInputFormat } from '../../src/util/moment';

describe.only('Documents flow tests', () => {
  before(() => {});
  it('Unarchive documents', () => {
    //Test for LF-2307
    //Action: on document read only user clicks unarchive, expected: unarchive modal pops up
    //Title shoube "Unarchive document?"
    //Body should read “Unarchiving this document will return it to your list of currently valid documents.
    //Valid documents will be exported for your certifications. Do you want to proceed?”
    // Primary button “Unarchive” should exist
    //Secondary button: “Cancel” should exists
    //Click anywhere in the background to dismiss the modal without making any changes
    //Click the “Cancel” button to dismiss the modal without making any changes
    //Click “Unarchive” to change the status of this document to “Valid”
  });
});
