(function () {
  "use strict";

  /**
   * ------------------------------------------------------------------------
   *  Move the demo script to the footer before </body> 
   *  and edit the script for dynamic data needs.
   * ------------------------------------------------------------------------
   */

  // Copy color value from CSS :root
  const style              =   getComputedStyle(document.body);
  const text_primary_500   =   style.getPropertyValue('--primary');
  const text_secondary_500 =   style.getPropertyValue('--secondary');
  const text_yellow_500    =   style.getPropertyValue('--yellow');
  const text_green_500     =   style.getPropertyValue('--green');
  const text_gray_500      =   style.getPropertyValue('--gray');

  // Convert HEX TO RGBA
  function hexToRGBA(hex, opacity) {
    if (hex != null) {
      return 'rgba(' + (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length/3 + '})', 'g')).map(function(l) { return parseInt(hex.length%2 ? l+l : l, 16) }).concat(isFinite(opacity) ? opacity : 1).join(',') + ')';
    }
  }

  // Demo Charts JS
  const myCharts = function () {
    Chart.defaults.color  =   text_gray_500;

    // ANALITICS 1 LINE CHART
    const chart_line_a = document.getElementById("SesionLine");
    if (chart_line_a != null) {
      const ctl_a = chart_line_a.getContext('2d');
      const SesionLine = new Chart(ctl_a, {
        type: 'line',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8'],
          datasets: [{
            label: 'Previous Week',
            data: [70, 121, 135, 234, 183, 104, 175, 13],
            fill: false,
            borderColor: text_secondary_500,
            borderDash: [5, 5],
            tension: 0.1,
            pointBackgroundColor: text_secondary_500
          },
          {
            label: 'Current Week',
            data: [13, 104, 175, 121, 231, 132, 283, 165],
            fill: false,
            borderColor: text_primary_500,
            tension: 0.1,
            pointBackgroundColor: text_primary_500
          }]
        },
        options: {
          animation: {
            y: {
              duration: 4000,
              from: 500
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              grid: {
                borderDash: [4, 4],
              },
              position: 'right'
            }
          }
        }
      })
    }
    // ANALITICS 2 LINE CHART
    const chart_line_ab = document.getElementById("SesionDuration");
    if ( chart_line_ab != null) {
      const ctl_ab = chart_line_ab.getContext('2d');
      const SesionDuration = new Chart(ctl_ab, {
        type: 'line',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8'],
          datasets: [{
            label: 'Previous Week',
            data: [6, 12, 8, 18, 11, 5, 16, 8],
            fill: false,
            borderColor: text_secondary_500,
            borderDash: [5, 5],
            tension: 0.1,
            pointBackgroundColor: text_secondary_500,
          },
          {
            label: 'Current Week',
            data: [8, 10, 15, 9, 14, 12, 18, 20],
            fill: false,
            borderColor: text_primary_500,
            tension: 0.1,
            pointBackgroundColor: text_primary_500
          }]
        },
        options: {
          animation: {
            y: {
              duration: 4000,
              from: 500
            }
          },
          plugins: {
            legend: {
              display: false,
            }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              grid: {
                borderDash: [4, 4],
              },
              position: 'right',
              ticks: {
                min: 0,
                max: 60,
                stepSize: 5,
                callback: function (value) {
                  return (value).toFixed(0) + 'm';
                },
              }
            }
          }
        }
      })
    }
    // ANALITICS 3 LINE CHART
    const chart_line_b = document.getElementById("BounceLine");
    if ( chart_line_b!= null) {
      const ctl_b = chart_line_b.getContext('2d');
      const BounceLine = new Chart(ctl_b, {
        type: 'line',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8'],
          datasets: [{
            label: 'Previous Week',
            data: [70, 21, 35, 34, 83, 14, 75, 13],
            fill: false,
            borderColor: text_secondary_500,
            borderDash: [5, 5],
            tension: 0.1,
            pointBackgroundColor: text_secondary_500
          },
          {
            label: 'Current Week',
            data: [13, 14, 75, 21, 31, 32, 83, 65],
            fill: false,
            borderColor: text_primary_500,
            tension: 0.1,
            pointBackgroundColor: text_primary_500
          }]
        },
        options: {
          animation: {
            y: {
              duration: 4000,
              from: 500
            }
          },
          plugins: {
            legend: {
              display: false,
            }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              grid: {
                borderDash: [4, 4],
              },
              position: 'right',
              ticks: {
                min: 0,
                max: 100,
                stepSize: 20,
                callback: function (value) {
                  return (value / this.max * 100).toFixed(0) + '%'; // convert it to percentage
                }
              }
            }
          }
        }
      })
    }
    // ANALITICS COUNTRY
    const chart_line_country = document.getElementById("CountryLine");
    if ( chart_line_country!= null) {
      const ctl_country = chart_line_country.getContext('2d');

      let primary_gradient = ctl_country.createLinearGradient(100, 200, 400, 600);
      primary_gradient.addColorStop(0, text_primary_500);
      primary_gradient.addColorStop(1, text_secondary_500);

      const CountryLine = new Chart(ctl_country, {
        type: 'bar',
        data: {
          labels: ['IN', 'US', 'ES', 'UK', 'RU', 'ID', 'BR', 'AR'],
          datasets: [{
            label: 'Session',
            data: [26, 18, 16, 12, 9, 6, 4, 2],
            backgroundColor: [
              primary_gradient
            ],
            borderColor: [
              primary_gradient
            ],
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false
            }
          },
          animation: {
            y: {
              duration: 4000,
              from: 500
            }
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              grid: {
                borderDash: [4, 4],
              },
              position: 'right',
              ticks: {
                min: 0,
                max: 60,
                stepSize: 5,
                callback: function (value) {
                  return (value).toFixed(0) + '%';
                },
              }
            }
          }
        }
      })
    }
    // ANALITICS DOUGHNUT CHART
    const chart_device = document.getElementById("DeviceChart");
    if ( chart_device != null) {
      const ctd = chart_device.getContext('2d');
      const DeviceChart = new Chart(ctd, {
        type: 'doughnut',
        data: {
          labels: ['Desktop','Tabs','Mobile'],
          datasets: [{
            label: 'Traffic Source',
            data: [925, 30, 252],
            backgroundColor: [
              text_primary_500,
              text_secondary_500,
              text_green_500
            ],
            hoverOffset: 4
          }]
        },
        options: {
          animation: {
            delay: 2000
          },
          plugins: {
            legend: {
              display: false,
            }
          }
        }
      })
    }
    // ANALITICS PIE CHART
    const chart_pie = document.getElementById("PieChart");
    if ( chart_pie != null) {
      const ctp = chart_pie.getContext('2d');
      const PieChart = new Chart(ctp, {
        type: 'pie',
        data: {
          labels: ['Chrome', 'Mozilla', 'Safari', 'Others'],
          datasets: [{
            label: 'Session',
            data: [300, 150, 26, 18],
            backgroundColor: [
              text_primary_500,
              text_secondary_500,
              text_yellow_500,
              text_green_500
            ],
            hoverOffset: 4
          }]
        },
        options: {
          animation: {
            delay: 2000
          },
          plugins: {
            legend: {
              display: false,
            }
          }
        }
      })
    }
    // ANALITICS USER CHART
    const chart_user = document.getElementById("UserChart");
    if ( chart_user != null) {
      const ctl = chart_user.getContext('2d');
      const UserChart = new Chart(ctl, {
        type: 'line',
        data: {
          labels: ['1', '2', '3', '4', '5', '6', '7'],
          datasets: [{
            label: 'Daily',
            data: [70, 121, 135, 105, 76, 150, 195],
            fill: false,
            borderColor: text_secondary_500,
            borderWidth: 1,
            radius: 0,
            tension: 0.1
          },
          {
            label: 'Weekly',
            data: [471, 521, 635, 534, 483, 504, 875],
            fill: false,
            borderColor: text_primary_500,
            borderWidth: 1,
            radius: 0,
            tension: 0.1
          },
          {
            label: 'Monthly',
            data: [1689, 1986, 2175, 1921, 1631, 2032, 2683],
            fill: false,
            borderColor: text_green_500,
            borderWidth: 1,
            radius: 0,
            tension: 0.1
          }]
        },
        options: {
          animation: {
            y: {
              duration: 4000,
              from: 500
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              grid: {
                borderDash: [4, 4],
              },
              title: {
                display: true,
                text: 'August'
              }
            },
            y: {
              display: true,
              grid: {
                display: false,
              },
              suggestedMin: -10,
              suggestedMax: 200
            }
          }
        }
      })
    }
    // ANALITICS BAR CHART
    const chart_traffic = document.getElementById("TrafficChart");
    if ( chart_traffic != null) {
      const ctb = chart_traffic.getContext('2d');
      const TrafficChart = new Chart(ctb, {
        type: 'bar',
        data: {
          labels: ['1', '2', '3', '4', '5', '6', '7'],
          datasets: [{
            label: 'Organic search',
            data: [70, 41, 35, 83, 73, 64, 75],
            backgroundColor: [
              text_primary_500,
            ]
          },
          {
            label: 'Direct',
            data: [27, 17, 15, 19, 12, 17, 11],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.8)
            ]
          },
          {
            label: 'Refferal',
            data: [24, 21, 35, 34, 23, 24, 15],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.6)
            ]
          },
          {
            label: 'Social',
            data: [9, 7, 12, 14, 18, 8, 9],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.4)
            ]
          },
          {
            label: 'Others',
            data: [30, 31, 35, 34, 33, 34, 35],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.2)
            ]
          }]
        },
        options: {
          animation: {
            delay: 2000,
          },
          plugins: {
            legend: {
              display: false,
            }
          },
          responsive: true,
          scales: {
            x: {
              stacked: true,
              display: true,
              grid: {
                display: false
              },
              title: {
                display: true,
                text: 'August'
              }
            },
            y: {
              stacked: true,
              grid: {
                borderDash: [4, 4]
              }
            }
          }
        }
      })
    }
    // ANALITICS BAR CHART
    const chart_referral = document.getElementById("ReferralChart");
    if ( chart_referral != null) {
      const ctb = chart_referral.getContext('2d');
      const ReferralChart = new Chart(ctb, {
        type: 'bar',
        data: {
          labels: ['1', '2', '3', '4', '5', '6', '7'],
          datasets: [{
            label: 'Google.com',
            data: [70, 54, 65, 73, 63, 64, 75],
            backgroundColor: [
              text_primary_500,
            ]
          },
          {
            label: 'Youtube.com',
            data: [17, 17, 15, 19, 12, 17, 11],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.8)
            ]
          },
          {
            label: 'Facebook.com',
            data: [24, 21, 35, 34, 23, 24, 15],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.6)
            ]
          },
          {
            label: 'Instagram.com',
            data: [9, 17, 12, 14, 18, 8, 9],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.4)
            ]
          },
          {
            label: 'Others',
            data: [10, 21, 15, 14, 23, 24, 15],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.2)
            ]
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false,
            }
          },
          responsive: true,
          scales: {
            x: {
              stacked: true,
              display: true,
              grid: {
                display: false
              },
              title: {
                display: true,
                text: 'August'
              }
            },
            y: {
              stacked: true,
              grid: {
                borderDash: [4, 4]
              }
            }
          }
        }
      })
    }

  
    // ECOMMERCE DOUGHNUT CHART
    const chart_dougnut = document.getElementById("DoughnutChart");
    if ( chart_dougnut != null) {
      const ctd = chart_dougnut.getContext('2d');
      const DoughnutChart = new Chart(ctd, {
        type: 'doughnut',
        data: {
          labels: ['Search Engine','Social Post','Paid Ads','Refferal Link','Direct Link','Other Source'],
          datasets: [{
            label: 'Traffic Source',
            data: [925, 430, 252, 135, 78, 53],
            backgroundColor: [
              text_green_500,
              text_primary_500,
              hexToRGBA( text_primary_500, 0.6),
              text_yellow_500,
              hexToRGBA( text_yellow_500, 0.6),
              text_secondary_500,
            ],
            hoverOffset: 4
          }]
        },
        options: {
          animation: {
            delay: 2000
          },
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            }
          }
        }
      })
    }
    // ECOMMERCE BAR CHART
    const chart_bar = document.getElementById("BarChart");
    if ( chart_bar != null) {
      const ctb = chart_bar.getContext('2d');
      const BarChart = new Chart(ctb, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [{
            label: '# Visitors',
            data: [1170, 1321, 1835, 1834, 2183, 1504, 2175, 2521],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.6)
            ],
            borderColor: [
              hexToRGBA( text_primary_500, 0.6)
            ],
            borderWidth: 1
          },
          {
            label: '# Sales',
            data: [670, 721, 835, 734, 683, 724, 875, 1021],
            backgroundColor: [
              text_primary_500,
            ],
            borderColor: [
              text_primary_500,
            ],
            borderWidth: 1
          }]
        },
        options: {
          animation: {
            y: {
              duration: 4000,
              from: 500
            }
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              grid: {
                borderDash: [4, 4]
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            }
          }
        }
      })
    }
    // ECOMMERCE LINE CHART
    const chart_line = document.getElementById("LineChart");
    if ( chart_line != null) {
      const ctl = chart_line.getContext('2d');
      const LineChart = new Chart(ctl, {
        type: 'line',
        data: {
          labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [{
            label: 'Previous Week',
            data: [70, 121, 235, 334, 483, 304, 475],
            fill: false,
            borderColor: text_primary_500,
            cubicInterpolationMode: 'monotone',
            tension: 0.1
          },
          {
            label: 'Current Week',
            data: [13, 204, 175, 421, 331, 532, 683],
            fill: false,
            borderColor: text_green_500,
            cubicInterpolationMode: 'monotone',
            tension: 0.1
          }]
        },
        options: {
          animation: {
            y: {
              duration: 4000,
              from: 500
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true
              },
              grid: {
                display: false              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Daily Sales'
              },
              grid: {
                borderDash: [4, 4]
              },
              suggestedMin: -10,
              suggestedMax: 200
            }
          }
        }
      })
    }

    // PROJECT PRODUCTIFITY CHART
    const chart_line_productifity = document.getElementById("ProductifityLine");
    if ( chart_line_productifity!= null) {
      const ctl_a = chart_line_productifity.getContext('2d');
      const ProductifityLine = new Chart(ctl_a, {
        type: 'line',
        data: {
          labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
          datasets: [{
            label: 'Previous Week',
            data: [12, 21, 18, 19, 17, 21, 25, 28],
            fill: false,
            borderColor: text_secondary_500,
            borderDash: [5, 5],
            tension: 0.1,
            cubicInterpolationMode: 'monotone',
            pointBackgroundColor: text_secondary_500
          },
          {
            label: 'Current Week',
            data: [15, 22, 16, 17, 18, 24, 27, 24],
            fill: false,
            borderColor: text_primary_500,
            tension: 0.1,
            cubicInterpolationMode: 'monotone',
            pointBackgroundColor: text_primary_500
          }]
        },
        options: {
          animation: {
            y: {
              duration: 4000,
              from: 500
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              },
              title: {
                display: true,
                text: 'August'
              }
            },
            y: {
              display: true,
              grid: {
                borderDash: [4, 4]
              },
              position: 'right',
              title: {
                display: true,
                text: 'Task'
              }
            }
          }
        }
      })
    }
    // PROJECT DOUGHNUT CHART
    const chart_team = document.getElementById("TeamChart");
    if ( chart_team != null) {
      const ctd = chart_team.getContext('2d');
      const TeamChart = new Chart(ctd, {
        type: 'doughnut',
        data: {
          labels: ['Complete','In Porgress','Not Finished'],
          datasets: [{
            label: 'Progress',
            data: [74, 9, 17],
            backgroundColor: [
              text_green_500,
              text_primary_500,
              text_secondary_500,
            ],
            hoverOffset: 4
          }]
        },
        options: {
          animation: {
            delay: 2000
          },
          plugins: {
            legend: {
              display: false,
            }
          }
        }
      })
    }
    // PROJECT BAR CHART
    const chart_budget = document.getElementById("BudgetChart");
    if ( chart_budget != null) {
      const ctb = chart_budget.getContext('2d');
      const BudgetChart = new Chart(ctb, {
        type: 'bar',
        data: {
          labels: ['UI/UX', 'Front End', 'Back End', 'Development'],
          datasets: [{
            label: 'Planned',
            data: [70, 41, 35, 83],
            backgroundColor: [
              text_primary_500
            ]
          },
          {
            label: 'Spend',
            data: [27, 17, 15, 19],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.8)
            ]
          },
          {
            label: 'Remaining',
            data: [24, 21, 35, 34],
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.6)
            ]
          }]
        },
        options: {
          animation: {
            delay: 2000
          },
          plugins: {
            legend: {
              display: false,
            }
          },
          responsive: true,
          scales: {
            x: {
              grid: {
                display: false
              },
              stacked: true,
              display: true,
            },
            y: {
              stacked: true,
              grid: {
                borderDash: [4, 4]
              },
              ticks: {
                min: 0,
                max: 200,
                stepSize: 5,
                callback: function (value) {
                  return (value).toFixed(0) + 'k';
                },
              }
            }
          }
        }
      })
    }

    
    // CRM CHART LINE AREA
    const chart_linearea = document.getElementById("LineArea");
    if ( chart_linearea != null) {
      const ctla = chart_linearea.getContext('2d');
      
      const gradientIndigo = ctla.createLinearGradient(0, 230, 0, 50);
      gradientIndigo.addColorStop(1, hexToRGBA( text_primary_500, 0.3));
      gradientIndigo.addColorStop(0.2, hexToRGBA( text_primary_500, 0.02));
      gradientIndigo.addColorStop(0, hexToRGBA( text_primary_500, 0.01));

      const LineArea = new Chart(ctla, {
        type: 'line',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11', 'Aug 12'],
          datasets: [{
            fill: {
              target: 'origin'
            },
            borderColor: text_primary_500,
            backgroundColor: gradientIndigo,
            label: 'Deals',
            tension: 0.3,
            pointBackgroundColor: text_primary_500,
            pointBorderWidth: 0,
            pointHitRadius: 30,
            pointHoverBackgroundColor: text_primary_500,
            pointHoverRadius: 5,
            pointRadius: 0,
            data: [120, 462, 323, 184, 187, 362, 324, 429, 289, 559, 461, 394, 541],
          }],
        },
        options: {
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              grid: {
                borderDash: [4, 4]
              }
            }
          },
          animation: {
            y: {
              duration: 4000,
              from: 500
            }
          },
          plugins: {
            legend: {
              display: false
            },
          },
        }
      })
    }
    // CRM BAR CHART
    const chart_crm = document.getElementById("CrmChart");
    if ( chart_crm != null) {
      const ctb = chart_crm.getContext('2d');
      const CrmChart = new Chart(ctb, {
        type: 'scatter',
        data: {
          labels: [
            'April', 'May', 'June', 'July', 'August',
          ],
          datasets: [{
            type: 'line',
            label: 'Preview Data',
            data: [180, 110, 155, 80, 98],
            backgroundColor: [
              text_secondary_500,
            ],
            borderColor: text_secondary_500,
            borderDash: [4, 4],
          }, 
          {
            type: 'bar',
            label: 'Deal',
            data: [180, 110, 155, 80, 98],
            fill: false,
            backgroundColor: [
              hexToRGBA( text_primary_500, 0.4)
            ],
            borderColor: [
              hexToRGBA( text_primary_500, 0.4)
            ],
            borderWidth: 2
          }]
        },
        options: {
          animation: {
            delay: 2000
          },
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
    // CRM PIPELINE CHART
    const chart_pipeline = document.getElementById("PipelineChart");
    if ( chart_pipeline != null) {
      const ctb = chart_pipeline.getContext('2d');
      const PipelineChart = new Chart(ctb, {
        type: 'bar',
        data: {
          labels: [
            'Qualified', 'Lead', 'Meeting', 'Proposal Send', 'Deal',
          ],
          datasets: [{
            label: 'Clents',
            data: [270, 220, 155, 122, 98],
            backgroundColor: [
              text_primary_500,
              hexToRGBA( text_primary_500, 0.8),
              hexToRGBA( text_primary_500, 0.6),
              hexToRGBA( text_primary_500, 0.4),
              hexToRGBA( text_primary_500, 0.2)
            ],
            borderColor: [
              text_primary_500,
              hexToRGBA( text_primary_500, 0.8),
              hexToRGBA( text_primary_500, 0.6),
              hexToRGBA( text_primary_500, 0.4),
              hexToRGBA( text_primary_500, 0.2)
            ],
            borderWidth: 1
          }]
        },
        options: {
          animation: {
            x: {
              duration: 4000,
              from: 0
            }
          },
          scales : {
            x: {
              display: true,
              grid: {
                borderDash: [4, 4]
              }
            },
            y: {
              display: true,
              grid: {
                display: false
              }
            }
          },
          indexAxis: 'y',
          elements: {
            bar: {
              borderWidth: 2,
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            }
          }
        }
      })
    }
    // CRM EMAIL DOUGHNUT CHART
    const chart_email = document.getElementById("EmailChart");
    if ( chart_email != null) {
      const ctd = chart_email.getContext('2d');
      const EmailChart = new Chart(ctd, {
        type: 'doughnut',
        data: {
          labels: ['Read','Spam','Unread'],
          datasets: [{
            label: 'Traffic Source',
            data: [925, 30, 252],
            backgroundColor: [
              text_primary_500,
              text_secondary_500,
              text_yellow_500
            ],
            hoverOffset: 4
          }]
        },
        options: {
          animation: {
            delay: 2000
          },
          plugins: {
            legend: {
              display: true,
              position: "bottom",
            }
          }
        }
      })
    }


    // HOSTING STORAGE
    const chart_storage = document.getElementById("StorageChart");
    if ( chart_storage != null) {
      const ctds = chart_storage.getContext('2d');
      const StorageChart = new Chart(ctds, {
        type: 'doughnut',
        data: {
          labels: ['Used','Free'],
          datasets: [{
            label: 'Storage',
            data: [90000, 52000],
            backgroundColor: [
              text_primary_500,
              text_green_500
            ],
            hoverOffset: 4
          }]
        },
        options: {
          animation: {
            delay: 2000
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }


    // CMS SMALL CHART LINE
    const chart_linesm = document.getElementById("LineAreaSm");
    if ( chart_linesm != null) {
      const ctla = chart_linesm.getContext('2d');

      const gradientIndigo = ctla.createLinearGradient(0, 70, 0, 0);

      gradientIndigo.addColorStop(1, hexToRGBA( text_primary_500, 0.5));
      gradientIndigo.addColorStop(0.2, hexToRGBA( text_secondary_500, 0.02));
      gradientIndigo.addColorStop(0, hexToRGBA( text_primary_500, 0.01));

      const LineAreaSm = new Chart(ctla, {
        type: 'line',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11'],
          datasets: [{
            fill: {
              target: 'origin'
            },
            borderColor: text_primary_500,
            backgroundColor: gradientIndigo,
            label: 'Page views',
            tension: 0.3,
            pointBackgroundColor: text_primary_500,
            pointBorderWidth: 0,
            pointHitRadius: 30,
            pointHoverBackgroundColor: text_primary_500,
            pointHoverRadius: 5,
            pointRadius: 0,
            data: [1170, 1321, 1835, 1834, 2183, 1504, 2175, 2521, 1835, 1834, 2183],
          }],
        },
        options: {
          scales: {
            x: {
              display: false
            },
            y: {
              display: false
            }
          },
          animation: {
            y: {
              duration: 2000,
              from: 500
            }
          },
          plugins: {
            legend: {
              display: false
            },
          },
        }
      })
    }
    // CMS SMALL CHART BAR
    const chart_barsm = document.getElementById("BarChartSm");
    if ( chart_barsm != null) {
      const ctb = chart_barsm.getContext('2d');
      const gradientIndigo = ctb.createLinearGradient(0, 200, 0, 20);

      gradientIndigo.addColorStop(1, hexToRGBA( text_primary_500 ));
      gradientIndigo.addColorStop(0.2, hexToRGBA( text_secondary_500 ));

      const BarChartSm = new Chart(ctb, {
        type: 'bar',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11'],
          datasets: [{
            label: 'Likes',
            data: [120, 462, 323, 184, 187, 362, 324, 429, 289, 559, 461, 394, 541],
            backgroundColor: [
              gradientIndigo
            ],
            borderColor: [
              gradientIndigo
            ],
            borderWidth: 1
          }]
        },
        options: {
          animation: {
            y: {
              duration: 2000,
              from: 500
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              display: false
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
    
    // CMS COMMENTS CHART
    const chart_comments = document.getElementById("BarComments");
    if ( chart_comments != null) {
      const ctb = chart_comments.getContext('2d');
      const gradientIndigo = ctb.createLinearGradient(0, 200, 0, 20);

      gradientIndigo.addColorStop(1, hexToRGBA( text_green_500, 0.9));
      gradientIndigo.addColorStop(0.2, hexToRGBA( text_primary_500, 0.2));

      const BarComments = new Chart(ctb, {
        type: 'bar',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11'],
          datasets: [{
            label: 'Comments',
            data: [220, 362, 423, 584, 287, 162, 324, 429, 589, 659, 361, 594, 141],
            backgroundColor: [
              gradientIndigo
            ],
            borderColor: [
              gradientIndigo
            ],
            borderWidth: 1
          }]
        },
        options: {
          animation: {
            y: {
              duration: 2000,
              from: 500
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              display: false
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
    // CMS SHARE CHART
    const chart_share = document.getElementById("BarShare");
    if ( chart_share != null) {
      const ctb = chart_share.getContext('2d');
      const gradientIndigo = ctb.createLinearGradient(0, 200, 0, 20);

      gradientIndigo.addColorStop(1, hexToRGBA( text_secondary_500, 0.9));
      gradientIndigo.addColorStop(0.2, hexToRGBA( text_primary_500, 0.2));

      const BarShare = new Chart(ctb, {
        type: 'bar',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11'],
          datasets: [{
            label: 'Share',
            data: [70, 162, 23, 84, 17, 62, 24, 49, 89, 59, 41, 94, 51],
            backgroundColor: [
              gradientIndigo
            ],
            borderColor: [
              gradientIndigo
            ],
            borderWidth: 1
          }]
        },
        options: {
          animation: {
            y: {
              duration: 2000,
              from: 500
            }
          },
          scales: {
            x: {
              display: false
            },
            y: {
              display: false
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
    // CMS TRAFFIC CHART
    const chart_line_view = document.getElementById("PageView");
    if ( chart_line_view!= null) {
      const ctl_a = chart_line_view.getContext('2d');

      const PageView = new Chart(ctl_a, {
        type: 'line',
        data: {
          labels: ['Aug 1', 'Aug 2', 'Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8', 'Aug 9', 'Aug 10', 'Aug 11'],
          datasets: [{
            label: 'Previous Week',
            data: [1323, 1481, 1588, 1602, 1720, 1801, 1925, 1628, 1581, 1788, 1802],
            fill: {
              target: 'origin'
            },
            borderColor: text_secondary_500,
            backgroundColor: hexToRGBA( text_secondary_500, 0.1),
            tension: 0.3,
            pointBackgroundColor: text_secondary_500,
            pointBorderWidth: 0,
            pointHitRadius: 30,
            pointHoverBackgroundColor: text_secondary_500,
            pointHoverRadius: 5,
            pointRadius: 0
          },
          {
            label: 'Current Week',
            data: [1170, 1321, 1835, 1834, 2083, 1904, 2175, 2221, 2135, 2334, 2483],
            fill: {
              target: 'origin'
            },
            borderColor: text_primary_500,
            backgroundColor: hexToRGBA( text_primary_500, 0.1),
            tension: 0.3,
            pointBackgroundColor: text_primary_500,
            pointBorderWidth: 0,
            pointHitRadius: 30,
            pointHoverBackgroundColor: text_primary_500,
            pointHoverRadius: 5,
            pointRadius: 0,
          }]
        },
        options: {
          animation: {
            y: {
              duration: 2000,
              from: 500
            }
          },
          responsive: true,
          plugins: {
            legend: {
              display: false,
            }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              grid: {
                borderDash: [4, 4]
              }
            }
          }
        }
      })
    }
    // CMS GAUGE CHART
    const chart_gauge = document.getElementById("GaugeChart");
    if ( chart_gauge != null) {
      const ctd = chart_gauge.getContext('2d');
      const GaugeChart = new Chart(ctd, {
        type: "doughnut",
        data: {
          labels: ["Published", "Draft"],
          datasets: [{
              data: [320, 80],
              backgroundColor: [
                text_primary_500,
                text_secondary_500
              ],
              borderColor: [
                text_primary_500,
                text_secondary_500
              ],
              borderWidth: 1
          }]
        },
        options: {
          rotation: 180,
          circumference: 180,
          rotation: -90,
          cutout: 100,
          animation: {
            delay: 2000
          },
          plugins: {
            legend: {
              display: false,
            }
          }
        }
      })
    }
    // CMS GAUGE CHART 2
    const chart_seo = document.getElementById("SeoChart");
    if ( chart_seo != null) {
      const ctd = chart_seo.getContext('2d');
      const SeoChart = new Chart(ctd, {
        type: "doughnut",
        data: {
          labels: ["Optimized", "Need optimized"],
          datasets: [{
              data: [85, 15],
              backgroundColor: [
                text_green_500,
                hexToRGBA(text_gray_500, 0.2)
              ],
              borderColor: [
                text_green_500,
                hexToRGBA(text_gray_500, 0.2)
              ],
              borderWidth: 1
          }]
        },
        options: {
          rotation: 180,
          circumference: 180,
          rotation: -90,
          cutout: 100,
          animation: {
            delay: 2000
          },
          plugins: {
            legend: {
              display: false,
            }
          }
        }
      })
    }
  }

  // Demo Datepicker
  const myDatepicker = function () {
    // Datepicker
    const date_datepick = document.querySelectorAll('.datepick');
    if ( date_datepick != null) {
      for( let i = 0; i < date_datepick.length; i++)
      {
        flatpickr( date_datepick[i], {
          enableTime: true,
          allowInput: true,
          dateFormat: "Y-m-d H:i"
        });
      }
    }
    // Range Datepicker
    const date_start = document.querySelectorAll('.startDate');
    if ( date_start != null) {
      const date_end = document.querySelectorAll('.endDate');
      for( let i = 0; i < date_start.length; i++) {
        for( let x = 0; x < date_end.length; x++) {
          flatpickr( date_start[i], {
            enableTime: true,
            allowInput: true,
            dateFormat: "m/d/Y h:iK",
            "plugins": [new rangePlugin({ input: date_end[x]})]
          });
        }
      }
    }
  }
  
  // Preloader
  const myPreloader = function () {
    const xpre = document.querySelector(".preloader");
    if ( xpre != null) {
      window.addEventListener('load',function(){
        document.querySelector('body').classList.add("loaded-success")  
      });
    }
  }

  // Tables sorter
  const myTablesorter = function () {
    const els = document.querySelectorAll(".table-sorter");
    if ( els != null) {
      for( let i = 0; i < els.length; i++)
      {
        const table = new simpleDatatables.DataTable((els[i]));
      }
    };
  }

  // Lightbox
  const myLightbox = function () {
    // GLightbox
    const lightbox_class = document.querySelector(".glightbox3");
    if ( lightbox_class != null) {
      const lightbox = GLightbox({
        selector: '.glightbox3',
        touchNavigation: true,
        loop: true,
        autoplayVideos: true
      });
    }
  }

  // Form validation
  const myValidation = function () {
    // pristine js validation form
    const valid_form = document.querySelectorAll(".valid-form");

    if ( valid_form != null) {
      for( let i = 0; i < valid_form.length; i++){
        const pristine = new Pristine(valid_form[i]);

        valid_form[i].addEventListener('submit', function (e) {
          e.preventDefault();
          // check if the form is valid
          const valid = pristine.validate(); // returns true or false
        });
      }
    }
  }

  // Input tags
  const myTagify = function () {
    // tagify
    const input_tags = document.querySelectorAll("input.tagify");

    if ( input_tags != null) {
      for( let i = 0; i < input_tags.length; i++)
      {
        new Tagify(input_tags[i]);
      }
    }
  }

  // Custom JS
  const myCustom = function () {

    // insert your custom javascript on here
    
  }

  /**
   * ------------------------------------------------------------------------
   * Launch Functions
   * ------------------------------------------------------------------------
   */
  myCharts();
  myDatepicker();
  myTablesorter();
  myPreloader();
  myLightbox();
  myTagify();
  myValidation();
  myCustom();

})();