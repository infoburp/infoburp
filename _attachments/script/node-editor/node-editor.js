
// this function based on http://bl.ocks.org/2653660
function insert_editor(d,i){
    
var p = this.parentNode;
        console.log(this, arguments);
        
        // inject a HTML form to edit the content here...

        var el = d3.select(this);
        var p_el = d3.select(p);
        
        var frm = p_el.append("xhtml:form");
        
        var inp = frm
	            .attr("class","editor-form")
                    .append("input")
                        .attr("value", function() {
                            // nasty spot to place this call, but here we are sure that the <input> tag is available
                            // and is handily pointed at by 'this':
                            this.focus();
			    d.showHtml = "none";
                            return d.nodehtml;
                              })
                      	.style("height",FOREIGH_OBJECT_SIDE)
                 	.style("width",FOREIGH_OBJECT_SIDE)
                        // make the form go away when you jump out (form looses focus) or hit ENTER:
                        .on("blur", function() {
                            console.log("blur", this, arguments);
    
                            var txt = inp.node().value;
                            
                            d.nodehtml = txt;
			    d.showHtml = "block";
                                                        
                            p_el.select("form.editor-form").remove();
                        })
                        .on("keypress", function() {
 
                            var e = d3.event;
                            if (e.keyCode == 13)
				{

                                    if (e.stopPropagation)
					e.stopPropagation();
                                    e.preventDefault();
        
                                    var txt = inp.node().value;
                                    

				    //console.log(inp,p_el,p_el.select("form-editor.form"));
                               
				    d.nodehtml = txt;
				    d.showHtml = "inline";
                                    
				    el
					.text(function(d) { return d.nodehtml; });
                                
                                    p_el.select("form.editor-form").remove();
				}
                            });

    
};
