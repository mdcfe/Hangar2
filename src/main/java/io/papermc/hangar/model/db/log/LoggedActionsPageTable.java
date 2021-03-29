package io.papermc.hangar.model.db.log;


import io.papermc.hangar.model.internal.logs.LoggedAction;
import io.papermc.hangar.model.internal.logs.contexts.PageContext;

import java.net.InetAddress;

public class LoggedActionsPageTable extends LoggedActionTable {

    private final long projectId;
    private final long pageId;

    public LoggedActionsPageTable(long userId, InetAddress address, LoggedAction<PageContext> action) {
        super(userId, address, action);
        this.projectId = action.getContext().getProjectId();
        this.pageId = action.getContext().getPageId();
    }

    public long getProjectId() {
        return projectId;
    }

    public long getPageId() {
        return pageId;
    }

    @Override
    public String toString() {
        return "LoggedActionsPageTable{" +
                "projectId=" + projectId +
                ", pageId=" + pageId +
                "} " + super.toString();
    }
}
