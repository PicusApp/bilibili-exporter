export type InvokeResult<T> = {
  error?: string;
  data?: T;
};

export type DirEntryResponse = {
  is_dir: boolean;
};

export type VideoInfo = {
  videoPath: string;
  type: string;
  codecid: number;
  groupId: number;
  itemId: number;
  aid: number;
  cid: number;
  bvid: string;
  p: number;
  tabP: number;
  tabName: string;
  uid: string;
  uname: string;
  avatar: string;
  coverUrl: string;
  title: string;
  duration: number;
  groupTitle: string;
  groupCoverUrl: string;
  danmaku: number;
  view: number;
  pubdate: number;
  status: string;
  active: boolean;
  loaded: boolean;
  qn: number;
  allowHEVC: boolean;
  createTime: number;
  coverPath: string;
  groupCoverPath: string;
  updateTime: number;
  totalSize: number;
  loadedSize: number;
  progress: number;
  speed: number;
  completionTime: number;
  reportedSize: number;
};
