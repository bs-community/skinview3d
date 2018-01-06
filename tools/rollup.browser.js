import { buildType } from "./rollup-util";
export default buildType({
	postfix: "",
	babel: true,
	uglify: false,
	format: "umd"
});
