/**
 * The functions in this module is used fot projects and tasks
 * It contains common functions which are suit for both projects and tasks
 */
const { projects, tasks, accounts, buckets } = require('../config/mongoCollections');
const { Project, Task, Bucket } = require('../lib');
const { toCapitalize } = require('../utils/helpers');
const { upload } = require('./file');

/**
 * create function
 * @param {Project | Task} obj
 * @param {string} category project | task
 */
const create = async (obj, category, cb) => {
	if (!['project', 'task'].includes(category)) throw Error('category is invalid');

	let newObj;
	let collection;
	if (category === 'project') {
		newObj = new Project(obj);
		collection = await projects();
	} else {
		newObj = new Task(obj);
		collection = await tasks();
	}

	const { insertedId } = await collection.insertOne(newObj);

	// update bucket for members
	const accountsCol = await accounts();
	const memberId = newObj.members.map(item => item._id);
	const bucketIds = await accountsCol.find({ _id: { $in: memberId } }, { projection: { _id: 0, bucket: 1 } }).toArray();
	const updateFunc = bucketIds.map(
		async item => await Bucket.updateStatus(item.bucket, category + 's', insertedId, null, newObj.status)
	);
	await Promise.all(updateFunc);

	cb && (await cb(insertedId));

	return `${toCapitalize(category)} ${newObj.name} create successfully`;
};

/**
 * delete function
 * @param {string} objid
 * @param {string} category project | task
 */
 const deleteobj = async (objid, category, cb) => {
	if (!['project', 'task'].includes(category)) throw Error('category is invalid');

	let collection;
	if (category === 'project') {
		collection = await projects();
	} else {
		collection = await tasks();
	}

	const deleteobj = await collection.findOne({_id:objid});
	const { deletedCount } = await collection.deleteOne({ _id: objid });
	if (!deletedCount) throw Error('The object is not exist in list');
	console.log(deleteobj);
	// update bucket for members
	const accountsCol = await accounts();
	const memberId = deleteobj.members.map(item => item._id);
	const bucketIds = await accountsCol.find({ _id: { $in: memberId } }, { projection: { _id: 0, bucket: 1 } }).toArray();
	const updateFunc = bucketIds.map(
		async item => await Bucket.deleteObj(item.bucket, category + 's', objid,deleteobj.status)
	);
	await Promise.all(updateFunc);

	cb && (await cb(deleteobj));

	return `${toCapitalize(category)} ${deleteobj.name} delete successfully`;
};

/**
 * search function
 * @param {string} searchTerm
 * @param {string} accountId
 */
const search = async (searchTerm, accountId) => {
	let collection = await tasks();
	let task = await collection
		.find(
			{ members: { $elemMatch: { _id: accountId } }, name: { $regex: searchTerm, $options: '$i' } },
			{ projection: { _id: 0, name: 1, project: 1, status: 1 } }
		)
		.toArray();
	return task;
};

/**
 * get list data (project | task)
 * @param {string} category projects | tasks
 * @param {string} bucketId
 * @param {object} projection
 */
const getListFromBucket = async (category, bucketId, projection) => {
	const bucketsCol = await buckets();
	const data = await bucketsCol
		.aggregate([
			{
				$match: { _id: bucketId }
			},
			{
				$project: {
					list: {
						$concatArrays: [
							`$${category}.pending`,
							`$${category}.processing`,
							`$${category}.testing`,
							`$${category}.done`
						]
					},
					_id: 0
				}
			},
			{
				$lookup: {
					from: category,
					localField: 'list',
					foreignField: '_id',
					as: 'list'
				}
			},
			{
				$unwind: '$list'
			},
			{
				$replaceRoot: {
					newRoot: '$list'
				}
			},
			{
				$lookup: {
					from: 'accounts',
					localField: 'members._id',
					foreignField: '_id',
					pipeline: [{ $project: { disabled: 0, password: 0, bucket: 0 } }],
					as: 'members'
				}
			},
			{
				$project: projection
			}
		])
		.toArray();
	return data;
};

/**
 * upload attachments
 * @param {string} category projects | tasks
 * @param {string} _id project id | task id
 * @param {File[]} files
 */
const uploadAttachments = async (category, _id, files) => {
	const urls = await Promise.all(files.map(async file => await upload(file)));

	const collection = await eval(`${category}()`);
	const { modifiedCount } = await collection.updateOne({ _id }, { $addToSet: { attachments: { $each: urls } } });
	if (!modifiedCount) throw Error('Upload failed, please try again later');

	return 'Upload successfully';
};

/**
 * get attachments
 * @param {string} category projects | tasks
 * @param {string} _id project id | task id
 */
const getAttachments = async (category, _id) => {
	const collection = await eval(`${category}()`);
	const { attachments } = await collection.findOne({ _id }, { projection: { _id: 0, attachments: 1 } });

	return attachments;
};

module.exports = {
	create,
	search,
	deleteobj,
	getListFromBucket,
	uploadAttachments,
	getAttachments
};
