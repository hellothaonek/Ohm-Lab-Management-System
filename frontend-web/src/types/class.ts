export interface Class {
    classId: number
    subjectId: number
    lecturerId: string | null
    scheduleTypeId: number
    className: string
    classDescription: string
    classStatus: string
    subjectName: string | null
    lecturerName: string | null
    classUsers: any[]
}

export interface Subject {
    subjectId: number
    subjectName: string
    subjectCode: string
    subjectDescription: string
    subjectstatus: string
}

export interface CreateClassData {
    subjectId: number
    className: string
    classDescription: string
}

export interface UpdateClassData {
    subjectId: number
    className: string
    classDescription: string
    classStatus: string
}
