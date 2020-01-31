#!/bin/bash
set -e
if [ ! -d ".git" ];then
	echo "Please run this command in the root directory of the repository."
	exit 1
fi

checkout_dir="_ignore/master"
output_dir="js/dist"
revision_file="$output_dir/revision"

if [ -f "$revision_file" ];then
	last_revision=$(cat $revision_file)
	echo "> Current revison of build outputs: $last_revision"
fi

original_dir=$(pwd)
master_revision=$(git show-ref --hash -- refs/remotes/origin/master)

echo "> Checking out $master_revision"
echo "> Commit summary:"
git show --summary $master_revision
rm -rf -- $checkout_dir
mkdir -p -- $checkout_dir
git --work-tree=$checkout_dir checkout $master_revision -- .
cd -- $checkout_dir

echo "> Building"
npm install
npm run build

echo "> Copying build outputs"
cd -- $original_dir
rm -rf -- $output_dir
cp -r -- "$checkout_dir/bundles" "$output_dir"
echo "$master_revision" > $revision_file
echo "> New revison of build outputs: $master_revision"
