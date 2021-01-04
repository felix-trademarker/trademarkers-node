$( document ).ready(function() {

  let taskCounter = 2;

  


  $("#add-block").click(function(){
    if ( taskCounter <= 4 ) {

      let html = $("#taskDetails");
      html.append(`<div class="col-md-6">
                      <div class="form-group">
                          <label>Task# ${taskCounter}</label>
                          <input type="hidden" class="form-control" value="${taskCounter}" name="details[${taskCounter}][task_number]">
                      </div>
                      <div class="form-group">
                          <label>Task Description/Scope</label>
                          <textarea class="form-control" name="details[${taskCounter}][task_description]"></textarea>
                      </div>
                      <input type="hidden" class="form-control" value="pending" name="details[${taskCounter}][task_status]">
                  </div>`);
      taskCounter++;
    }

    if ( taskCounter > 4) {
      $("#add-block").hide();
    }
  });
// alert();


  if ( $("#myListDataTable").length ) {
    var tempTable = $("#myListDataTable").DataTable();

    tempTable.on('change',  '[name="markLead"]', function(){
      alert(this.checked);
      let value = this.checked;
      $.ajax({
        url: "/api/v1/olead/update",
        type:"post",
        dataType:"json",
        data: JSON.stringify({
          id: $(this).attr('data-id'),
          status : value
        }),
        contentType: "application/json",
        success: function( result ) {
  
          console.log(result);
        }
      });     
      
      // return false;
    });
  }

})