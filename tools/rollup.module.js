import { buildType } from "./rollup-util";
export default buildType({
	postfix: ".module",
	babel: false,
	uglify: false,
	format: "es"
});
