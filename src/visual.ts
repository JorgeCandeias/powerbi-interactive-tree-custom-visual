module powerbi.extensibility.visual {
    "use strict";
    export class Visual implements IVisual {

        private host: IVisualHost;
        private svg: d3.Selection<SVGElement>;
        private container: d3.Selection<SVGElement>;
        private circle: d3.Selection<SVGElement>;
        private textValue: d3.Selection<SVGElement>;
        private textLabel: d3.Selection<SVGElement>;

        constructor(options: VisualConstructorOptions) {
            this.svg = d3.select(options.element)
                .append('svg')
                .classed('circleCard', true);
            this.container = this.svg.append("g")
                .classed('container', true);
            this.circle = this.container.append("circle")
                .classed('circle', true);
            this.textValue = this.container.append("text")
                .classed("textValue", true);
            this.textLabel = this.container.append("text")
                .classed("textLabel", true);
        }

        public update(options: VisualUpdateOptions) {

            /* parse the incoming data into a tabular format so we can stratify it afterwards using d3 */
            let view = options.dataViews[0].categorical;
            let table = [];
            for (let i = 0; i < view.categories[0].values.length; ++i)
            {
                table.push({
                    "parent": <string>view.categories[0].values[i],
                    "child": <string>view.categories[1].values[i],
                    "value": <number>view.values[0].values[i]
                });
            }

            /* stratify the tabular data */
            let root = d3.stratify()
                .id(function(d) { return d.child; })
                .parentId(function(d) { return d.parent; })
                (table);
            

            console.log(table.length);




            let width: number = options.viewport.width;
            let height: number = options.viewport.height;
            this.svg.attr({
                width: width,
                height: height
            });
            let radius: number = Math.min(width, height) / 2.2;
            this.circle
                .style("fill", "white")
                .style("fill-opacity", 0.5)
                .style("stroke", "black")
                .style("stroke-width", 2)
                .attr({
                    r: radius,
                    cx: width / 2,
                    cy: height / 2
                });
            let fontSizeValue: number = Math.min(width, height) / 5;
            this.textValue
                .text("Value")
                .attr({
                    x: "50%",
                    y: "50%",
                    dy: "0.35em",
                    "text-anchor": "middle"
                }).style("font-size", fontSizeValue + "px");
            let fontSizeLabel: number = fontSizeValue / 4;
            this.textLabel
                .text("Label")
                .attr({
                    x: "50%",
                    y: height / 2,
                    dy: fontSizeValue / 1.2,
                    "text-anchor": "middle"
                })
                .style("font-size", fontSizeLabel + "px");
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        /*
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
        */
    }
}