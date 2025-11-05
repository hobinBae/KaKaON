package com.s310.kakaon.domain.store.entity;

import static com.querydsl.core.types.PathMetadataFactory.*;

import com.querydsl.core.types.dsl.*;

import com.querydsl.core.types.PathMetadata;
import javax.annotation.processing.Generated;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.PathInits;


/**
 * QBusinessHour is a Querydsl query type for BusinessHour
 */
@Generated("com.querydsl.codegen.DefaultEntitySerializer")
public class QBusinessHour extends EntityPathBase<BusinessHour> {

    private static final long serialVersionUID = 1704355577L;

    private static final PathInits INITS = PathInits.DIRECT2;

    public static final QBusinessHour businessHour = new QBusinessHour("businessHour");

    public final NumberPath<Long> businessHourId = createNumber("businessHourId", Long.class);

    public final BooleanPath closed = createBoolean("closed");

    public final TimePath<java.time.LocalTime> closeTime = createTime("closeTime", java.time.LocalTime.class);

    public final EnumPath<java.time.DayOfWeek> dayOfWeek = createEnum("dayOfWeek", java.time.DayOfWeek.class);

    public final TimePath<java.time.LocalTime> openTime = createTime("openTime", java.time.LocalTime.class);

    public final QStore store;

    public QBusinessHour(String variable) {
        this(BusinessHour.class, forVariable(variable), INITS);
    }

    public QBusinessHour(Path<? extends BusinessHour> path) {
        this(path.getType(), path.getMetadata(), PathInits.getFor(path.getMetadata(), INITS));
    }

    public QBusinessHour(PathMetadata metadata) {
        this(metadata, PathInits.getFor(metadata, INITS));
    }

    public QBusinessHour(PathMetadata metadata, PathInits inits) {
        this(BusinessHour.class, metadata, inits);
    }

    public QBusinessHour(Class<? extends BusinessHour> type, PathMetadata metadata, PathInits inits) {
        super(type, metadata, inits);
        this.store = inits.isInitialized("store") ? new QStore(forProperty("store"), inits.get("store")) : null;
    }

}

