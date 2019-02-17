module powerbi.extensibility.visual {

    "use strict";

    export class Visual implements IVisual {

        private svg: d3.Selection<SVGElement>;
        private container: d3.Selection<SVGElement>;

        private duration: number = 750;
        private i: number = 0;
        private diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        private tree: any;
        private root: any;

        constructor(options: VisualConstructorOptions) {

            this.svg = d3.select(options.element)
                .append('svg')
                .style("font", "10px sans-serif")
                .style("user-select", "none");

            this.container = this.svg.append("g")
                .classed("container", true);
        }

        public update(options: VisualUpdateOptions) {

            // adjust the svg size
            let margin =
            {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            };
            let width = options.viewport.width - margin.right - margin.left;
            let height = options.viewport.height - margin.top - margin.bottom;
            this.svg.attr({
                width: options.viewport.width,
                height: options.viewport.height
            });
            this.container.attr({
                width: width,
                height: height,
                transform: "translate(" + margin.top + "," + margin.left + ")"
            });
            
            // parse the incoming data into a tabular format so we can stratify it afterwards
            let view = options.dataViews[0].categorical;
            let table = [];
            for (let i = 0; i < view.categories[0].values.length; ++i)
            {
                table.push({
                    parent: <string>view.categories[0].values[i],
                    name: <string>view.categories[1].values[i],
                    value: <number>view.values[0].values[i]
                });
            }

            // stratify to a hierarchy
            let data = (<any>d3).stratify()
                .id(d => d.name)
                .parentId(d => d.parent)
                (table);
            
            // reset helpers
            this.i = 0;
            this.tree = d3.layout
                .tree()
                .size([height, width]);
            this.root = data;
            this.root.x0 = height / 2;
            this.root.y0 = 0;

            // update the tree
            this.updateNode(this.root);
        }

        private click(d: any)
        {
            if (d.children)
            {
              d._children = d.children;
              d.children = null;
            }
            else
            {
              d.children = d._children;
              d._children = null;
            }

            this.updateNode(d);
        }

        private updateNode(source: any)
        {
            // compute the new tree layout
            let nodes = this.tree.nodes(this.root).reverse();
            let links = this.tree.links(nodes);

            // normalize for fixed-depth
            nodes.forEach(d => { d.y = d.depth * 180; });

            // update the nodes
            let node = this.container
                .selectAll("g.node")
                .data(nodes, d => (<any>d).id || ((<any>d).id = ++this.i));

            // enter any new nodes at the parents previous position
            let nodeEnter = node
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", d => "translate(" + source.y0 + "," + source.x0 + ")")
                .on("click", d => this.click(d));

            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("fill", d => (<any>d)._children ? "lightsteelblue" : "#fff");

            nodeEnter.append("text")
                .attr("x", d => (<any>d).children || (<any>d)._children ? -13 : 13)
                .attr("dy", ".35em")
                .attr("text-anchor", d => (<any>d).children || (<any>d)._children ? "end" : "start")
                .text(d => (<any>d).id)
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(this.duration)
                .attr("transform", d => "translate(" + (<any>d).y + "," + (<any>d).x + ")");

            nodeUpdate.select("circle")
                .attr("r", 10)
                .style("fill", d => (<any>d)._children ? "lightsteelblue" : "#fff");

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            let nodeExit = node.exit().transition()
                .duration(this.duration)
                .attr("transform", d => "translate(" + source.y + "," + source.x + ")")
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);
                
            nodeExit.select("text")
                .style("fill-opacity", 1e-6);
                
            // Update the links…
            let link = this.container.selectAll("path.link")
                .data(links, d => (<any>d).target.id);

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", d => {
                    var o = {x: source.x0, y: source.y0};
                    return this.diagonal({source: o, target: o});
                });

            // Transition links to their new position.
            link.transition()
                .duration(this.duration)
                .attr("d", this.diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit()
                .transition()
                .duration(this.duration)
                .attr("d", d => {
                    var o = {x: source.x, y: source.y};
                    return this.diagonal({source: o, target: o});
                })
                .remove();

            // Stash the old positions for transition.
            nodes.forEach(d => {
	            d.x0 = d.x;
	            d.y0 = d.y;
            });
        }

        /*
        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }
        */

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