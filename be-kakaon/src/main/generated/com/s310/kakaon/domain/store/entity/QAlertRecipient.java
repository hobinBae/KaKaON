package com.s310.kakaon.domain.store.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QAlertRecipient is a Querydsl query type for AlertRecipient
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QAlertRecipient extends EntityPathBase<AlertRecipient> {

    private static final long serialVersionUID = -642026478L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QAlertRecipient alertRecipient = new QAlertRecipient("alertRecipient");

    public final com.s310.kakaon.global.entity.QBaseEntity _super = new com.s310.kakaon.global.entity.QBaseEntity(this);

    public final BooleanPath active = createBoolean("active");

    //inherited
    public final DateTimePath<java.time.LocalDateTime> createdDateTime = _super.createdDateTime;

    public final StringPath email = createString("email");

    public final NumberPath<Long> id = createNumber("id", Long.class);

    //inherited
    public final DateTimePath<java.time.LocalDateTime> lastModifiedDateTime = _super.lastModifiedDateTime;

    public final StringPath name = createString("name");

    public final StringPath position = createString("position");

    public final QStore store;

    public QAlertRecipient(String variable) {
        this(AlertRecipient.class, forVariable(variable), INITS);
    }

    public QAlertRecipient(Path<? extends AlertRecipient> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QAlertRecipient(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QAlertRecipient(PathMetadata metadata, PathInits inits) {
        this(AlertRecipient.class, metadata, inits);
    }

    public QAlertRecipient(Class<? extends AlertRecipient> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.store = inits.isInitialized("store") ? new QStore(forProperty("store"), inits.get("store")) : null;
    }

}

