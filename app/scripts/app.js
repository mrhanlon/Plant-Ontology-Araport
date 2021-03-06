/*global _*/
/*jshint camelcase: false*/
(function(window, $, _, undefined) {
  'use strict';

  console.log('Plant Ontology Lookup Service');

  var appContext = $('[data-app-name="plant-ontology-lookup-service"]');

  var templates = {
    resultTable: _.template('<table class="table"><thead><th>Match</th><th>Match Type</th><th>Accession ID</th><th>Aspect</th><th>Is Synonym Of</th></thead><tbody><% _.each(result, function(r) { %><%= resultRow(r) %><% }); %></tbody></table>'),
    resultRow: _.template('<% for (var i = 0; i < _.length; i++) { %><tr><% if (i === 0) { %><td rowspan="<%= _.length %>"><%= match %></td><% } %><td><%= match_type %></td><td><%= accession_id %></td><td><%= aspect %></td><td><% if (typeof is_synonym_of !== "undefined") { %><%=is_synonym_of %><% } %></td></tr><% } %>')
    //resultRow: _.template('<% for (var i = 0; i < _.length; i++) { %><tr><% if (i === 0) { %><td rowspan="<%= _.length %>"><%= match %></td><% } %><td></tr><% } %>')
    //resultTable: _.template('<table class="table"><thead><th>Related Locus</th><th>Direction</th><th>Score</th></thead><tbody><% _.each(result, function(r) { %><%= resultRow(r) %><% }); %></tbody></table>'),
    //resultRow: _.template('<% for (var i = 0; i < relationships.length; i++) { %><tr><% if (i === 0) { %><td rowspan="<%= relationships.length %>"><%= related_entity %> <button type="button" class="btn btn-info" name="gene-report" data-locus="<%= related_entity %>"><i class="fa fa-book"></i><span class="sr-only">Get Gene Report</button></td><% } %><td><%= relationships[i].direction %></td><td><% _.each(relationships[i].scores, function(score){ %><%= _.values(score)[0] %><% }); %></td></tr><% } %>'),
    //geneReport: _.template('<div class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" class="close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4>Gene Report: <%= locus %></h4></div><div class="modal-body"><% _.each(properties, function(prop) { %><h3><%= prop.type.replace("_"," ") %></h3><p><%= prop.value %></p><% }) %></div><div class="modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></div></div></div></div>')
  };

  /*
   * ADAMA - Araport Data API Mediator API
   * getStatus()
   * getNamespaces()
   * getServices()
   * search()
   *
   * Data APIs
   * {'namespace': 'aip', 'service': 'po_term_search_v0.2'}
   * {'namespace': 'aip', 'service': 'atted_coexpressed_by_locus_v0.1'}
   * {'namespace': 'aip', 'service': 'locus_gene_report_v0.1'}
   */
  var form = $('form[name=plant-ontology-lookup-query]', appContext);
  form.on('submit', function(e) {
    e.preventDefault();

    var Agave = window.Agave;

    // clear error messages
    $('.messages', this).empty();
    $('.has-error', this).removeClass('has-error');

    var query = {
      //locus: this.locus.value,
      //relationship_type: this.relationship_type.value,
      term: this.search_term.value
    };

    // basic validate
    var hasError = false;
    if (/[^a-zA-Z0-9]/.test(query.search_term)) {
      $(this.search_term).parent().addClass('has-error');
      $('.messages', this).append('<div class="alert alert-danger">Term must be alpha-numeric.</div>');
      hasError = true;
    }
    
    /*
    if (! query.locus) {
      $(this.locus).parent().addClass('has-error');
      $('.messages', this).append('<div class="alert alert-danger">Locus is required</div>');
      hasError = true;
    }
    if (! query.threshold) {
      $(this.threshold).parent().addClass('has-error');
      $('.messages', this).append('<div class="alert alert-danger">Threshold is required</div>');
      hasError = true;
    } else if (! /(\d+\.)?\d+/.test(query.threshold)) {
      $(this.threshold).parent().addClass('has-error');
      $('.messages', this).append('<div class="alert alert-danger">Threshold must be numeric</div>');
      hasError = true;
    }
    */
    
    if (! hasError) {
      $('.results').html('<pre><code>' + JSON.stringify(query, null, 2) + '</code></pre>');
    }

    Agave.api.adama.getStatus({}, function(resp) {
      if (resp.obj.status === 'success') {
        Agave.api.adama.search(
          {'namespace': 'preecej', 'service': 'po_term_search_v0.2', 'queryParams': query},
          function(search) {
            $('.results', appContext).empty().html(templates.resultTable({
              result: search.obj.PO_term_search_response,
              resultRow: templates.resultRow
            /*$('.results', appContext).empty().html(templates.resultTable({
              result: search.obj.result,
              resultRow: templates.resultRow
              */
            }));
/*
            $('button[name=gene-report]', appContext).on('click', function(e) {
              e.preventDefault();
              var btn, locus;
              btn = $(this);
              locus = btn.attr('data-locus');

              Agave.api.adama.search(
                {'namespace': 'aip', 'service': 'locus_gene_report_v0.1', 'queryParams': {'locus': locus}},
                function(search) {
                  $(templates.geneReport(search.obj.result[0])).appendTo('body').modal();
                }
              );
            });
*/
            $('.results table', appContext).dataTable({
              'order': [[ 2, 'desc' ]]
            });
          });
      } else {
        // ADAMA is not available, show a message
        $('.messages', this).append('<div class="alert alert-danger">The Query Service is currently unavailable. Please try again later.</div>');
      }
    });

  });

})(window, jQuery, _);
