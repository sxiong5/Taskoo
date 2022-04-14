interface DBCollections {
	_id: string;
}

interface AccountInfo extends DBCollections {
	fullName?: string;
	avatar: string | null;
}

interface Account extends AccountInfo {
	email: string;
	firstName: string;
	lastName: string;
	department: string;
	position: string;
	bucket: string;
}

interface ProjectList extends DBCollections {
	name: string;
	createTime: number;
	status: StaticStatus;
	members: Required<AccountInfo>[];
}

type ProjectForm = {
	name: string;
	description: string;
	members: (AccountInfo & { role: string })[];
	attachments: File[];
};
type ProjectFormData = Record<keyof ProjectForm, string | string[] | File | File[]>;

interface ContactList extends AccountInfo {
	email: string;
	position: string;
}

interface TaskInfo extends DBCollections {
	name: string;
	description?: string;
	dueTime: number;
	status: string;
	members: AccountInfo[];
}

interface Task extends TaskInfo {
	project: string;
	createTime: number;
	attachments?: string[];
}
