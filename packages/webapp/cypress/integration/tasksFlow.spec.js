describe.only('Tasks flow tests', () => {
    before(() => {
        //Ensure test environment is setup(i.e. farm exists, user accounts exist, tasks exist)
      
      })

      it('farm worker tasks flow tests', () => {
        //Unassigned tasks : Farm workers should be able to assign the task to themselves 
        //(the farm worker and “Unassigned” should be the only quick assign options)


        //Tasks assigned to the farm worker: Farm workers should be able to Unassign the task
        // (the farm worker and “Unassigned” should be the only quick assign options)

        //Tasks assigned to other individuals on the farm: None! Task card should be read-only

        //clicking on a task should open the read_only view for said task
        cy.url().should('include', '/read_only');
        //Assignee input should exist and should be.disabled
        //Due date input should exist and be disabled
        //locations map should exist and display here said task will be carried out
        //Task specific data should exist(e.g. cleaning agent and estimated water usage for a cleaning task)

      });

      it('admin user tasks flow tests', () => {
          
        //clicking on a task should open the read_only view for said task
        cy.url().should('include', '/read_only');
        //Assignee input should exist and should be.disabled
        //Due date input should exist and be disabled
        //locations map should exist and display here said task will be carried out
        //Task specific data should exist(e.g. cleaning agent and estimated water usage for a cleaning task)

      });


});