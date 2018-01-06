import { buildType } from "./rollup-util";
export default buildType({
	postfix: ".module",
	babel: true,
	uglify: false,
	format: "es"
});
